import { _decorator, CCInteger, Component, instantiate, isValid, Material, MeshRenderer, Node, Prefab, resources, Tween, tween, Vec3 } from 'cc';
import { Constant } from '../util/Constant';
import { Utils } from '../util/Utils';
import { HexGrid } from './HexGrid';
import { Hex } from './Hex';
const { ccclass, property } = _decorator;

@ccclass('HexGridManager')
export class HexGridManager extends Component {
    @property(Prefab)
    hexGridPrefab: Prefab = null;// 格子预制体

    @property(Prefab)
    numPrefab: Prefab = null!;

    @property({ type: CCInteger })
    maxHexCount: number = 10;// 格子最大同颜色六边形数量

    private _gridList: (HexGrid | null)[][] = [];
    private _gridSkinType: string = "Style1";// 格子皮肤类型
    private _hexSkinCountMax: number = 0;
    private _hexSkinCountLimit: number = 0
    private _col = 0;// 列数
    private _row = 0;// 行数
    private _startPoint: Vec3 = new Vec3();// 左下角，格子起始点
    private _gridRotation: Vec3 = new Vec3(0, 0, 0);// 格子旋转
    private _queue: number[] = [];
    // 变动的格子
    private _changeGridQueue: (HexGrid)[] = [];
    private _clearCount: number = 0;

    protected __preload(): void {
        Constant.hexGridManager = this;
    }

    start() {

    }

    update(deltaTime: number) {

    }

    init(list: number[], col: number, skinCount: number, createSkinCount: number) {
        this.node.setRotationFromEuler(this._gridRotation);

        this._hexSkinCountMax = skinCount;
        this._hexSkinCountLimit = createSkinCount;
        this._col = col;
        this._row = Math.ceil(list.length / col);
        this._startPoint = Utils.getLeftBottomPoint(this._row, this._col);
        this.clearGridList();
        this.draw3DHexGrid(list);
    }

    /** 绘制3D格子 */
    draw3DHexGrid(list: number[]) {
        const startPoint = this._startPoint;
        const gridSize = Constant.HEX_SIZE;

        // this.clearGridList();

        // 左下角开始遍历
        for (let i = 0; i < this._row; i++) {
            this._gridList[i] = []
            for (let j = 0; j < this._col; j++) {
                this._gridList[i][j] = null;

                const k = this.getIndex(i, j);
                const code = list[k];
                // 小于0和非-5的直接过滤掉
                if (code < 0 && (code !== Constant.GRID_SKIN_PROPS.VEDIO && code !== Constant.GRID_SKIN_PROPS.LOCK)) {
                    continue;
                }

                const pos = Utils.convertRowColToPosHexagon(i, j, gridSize, startPoint.x, startPoint.z);
                const hexGrid = this.generateGrid(pos);
                this._gridList[i][j] = hexGrid;

                this.setGridSkin(code, hexGrid);
                hexGrid.setType(code);
                hexGrid.setMaxHexCount(this.maxHexCount);

                if (code > 0) {
                    const hexList = Constant.hexManager.batchGenerateHexList(code, pos, this._hexSkinCountLimit, this._hexSkinCountMax);
                    hexGrid.setHexList(hexList);

                    hexGrid.showNum();
                } else if (code === Constant.GRID_SKIN_PROPS.VEDIO || code === Constant.GRID_SKIN_PROPS.LOCK) {
                    // 视频或等级解锁
                    hexGrid.showMaterial(code);
                }
            }
        }
    }

    /** 生成格子 */
    generateGrid(pos: Vec3) {
        const hexGridNode = instantiate(this.hexGridPrefab);
        hexGridNode.setPosition(pos);
        hexGridNode.setParent(this.node);

        const numNode: Node = instantiate(this.numPrefab);
        numNode.setPosition(Vec3.ZERO);
        numNode.setParent(hexGridNode);
        numNode.active = false;

        const hexGridComp = hexGridNode.getComponent(HexGrid);
        hexGridComp.setNumNode(numNode);
        return hexGridComp;
    }

    getSkinType(skinType: number) {
        let code = Math.abs(skinType);
        switch (code) {
            case Constant.GRID_SKIN_PROPS.ACTIVE:
                code = Constant.GRID_SKIN_PROPS.ACTIVE;
                break;
            default:
                code = Constant.GRID_SKIN_PROPS.DEFAULT;
                break;
        }
        const skinObj = Constant.GRID_SKIN_TYPE[this._gridSkinType]
        const name = skinObj.skin + code
        const path = skinObj.prefix + name
        return [path, name]
    }

    setMaterial(node: Node, path: string) {
        const meshNode = node ? node.children[0]!.children[0]!.children[0] : null
        if (meshNode) {
            resources.load(path, Material, (err, material) => {
                meshNode.getComponent(MeshRenderer).material = material;
            });
        }
    }

    setGridSkin(skinType: number, hexGrid: HexGrid) {
        const [path, name] = this.getSkinType(skinType);
        this.setMaterial(hexGrid.node, path);
    }

    setGridHexList(hexGrid: HexGrid, hexList: Hex[]) {
        if (hexGrid && hexGrid.isEmpty()) {
            const pos = hexGrid.getPosition();
            hexGrid.setHexList(hexList);
            // 重新设置位置和parent
            hexList.forEach((hex, index) => {
                const y = pos.y + Constant.HEX_SIZE_Y_H * (index + 1);
                const newPos = new Vec3(pos.x, y, pos.z);
                hex.setPosition(newPos);
                hex.resetOriginParent();
            });

            hexGrid.showNum();
            return true;
        }
        return false;
    }

    /** 根据位置获取格子对象 */
    getGridByPos(pos: Vec3) {
        const startPoint = this._startPoint;
        const [row, col] = Utils.convertPosToRowColHexagon(pos, Constant.HEX_SIZE, startPoint.x, startPoint.z);
        // console.log('行列', row, col);
        if (row < 0 || row >= this._row || col < 0 || col >= this._col) {
            console.log('超出范围', row, col);
            return null;
        }
        return this._gridList[row][col];
    }

    getIndex(row: number, col: number) {
        return row * this._col + col;
    }

    getRowColByIndex(index: number) {
        const row = Math.floor(index / this._col);
        const col = index % this._col;
        return [row, col];
    }

    /** 检测相邻同色格子并消除 */
    checkHexGridData(hexGrid: HexGrid) {
        this._clearCount = 0;
        this._changeGridQueue.push(hexGrid);
        this.runNextChangeGrid();
    }

    /** 检测发生变动格子的颜色 */
    async checkChangeHexGrid(hexGrid: HexGrid) {
        try {
            console.log('checkChangeHexGrid', hexGrid);
            if (!hexGrid || hexGrid.isEmpty()) {
                return this.runNextChangeGrid();
            }

            let row = -1, col = -1;
            this._gridList.forEach((rows, i) => {
                const j = rows.findIndex((item) => item && item.node.uuid === hexGrid.node.uuid);
                if (j > -1) {
                    row = i;
                    col = j;
                }
            });
            if (row < 0 || col < 0) {
                return this.runNextChangeGrid();
            }
            // 不允许同时设置标记，因此加个同步
            const markGridList = await this.getMarkGridList(hexGrid, row, col);
            console.log('markGridList', markGridList);
            if (!Array.isArray(markGridList) || markGridList.length < 2) {
                return this.runNextChangeGrid();
            };
            // 转移
            this.moveHexGridData(markGridList, 0);
        } catch (e) {
            console.log('error', e);
            this.runNextChangeGrid();
        }
    }

    async getMarkGridList(hexGrid: HexGrid, row: number, col: number) {
        return new Promise((resolve, reject) => {
            // 颜色纹理
            const texture = hexGrid.getTopHexType();
            console.log('row, col, texture', row, col, texture);
            if (!texture) {// 如果纹理为空，说明是非法数据，立刻清除该grid的所有数据
                this.checkAndDelInvalidNode(hexGrid, 0);
                return resolve([]);
            }
            // 标记
            this.checkSiblingGridSameColor(row, col, texture);

            // 获取标记的格子列表
            const markGridList = []
            this._gridList.forEach((list, row) => {
                (list || []).forEach((item, col) => {
                    if (item && item.isMark) {
                        console.log('标记格子', row, col);
                        markGridList.push([item, row, col]);
                        // 消除标记
                        item.setIsMark(false);
                    }
                });
            });
            // 重新排序，为了找出相邻是相连的(从左往右，从下往上)
            markGridList.sort((a, b) => {
                if (a[2] === b[2]) {
                    return b[1] - a[1]
                }
                return a[2] - b[2]
            });
            return resolve(markGridList);
        }).catch((e) => {
            console.log('error', e);
            return Promise.reject([]);
        });
    }

    /** 检查下一个变动 */
    runNextChangeGrid() {
        if (!this._changeGridQueue.length) {
            console.log('change count', this._clearCount);
            return;
        }

        // 继续检查下一个
        const nexHexGrid = this._changeGridQueue.shift();
        if (nexHexGrid) {
            this.checkChangeHexGrid(nexHexGrid);
        }
    }

    /** 移动格子的方块 */
    moveHexGridData(markGridList: (HexGrid | number)[], index: number) {
        const n = markGridList.length;
        if (n < 2) {
            return this.runNextChangeGrid();
        }
        
        if (index >= n - 1) {
            const last = markGridList[n - 1];
            console.log('移动完成 row, col', last[1], last[2], markGridList);
            
            // 消除
            this.clearHexGridData(last[0]);

            // 继续检查下一个
            return this.runNextChangeGrid();
        }

        const cur = markGridList[index];
        const curGrid: HexGrid = cur[0];
        const curHexList = curGrid.getTopAllSame();

        const nex = markGridList[index + 1];
        const nexGrid: HexGrid = nex[0];
        const topHex = nexGrid.getTopHex();
        const nexPos = topHex.getPosition().clone();

        console.log('移动方块新位置 pos', nexPos, nex[1], nex[2]);

        let lastHex = null;
        const taskList = [];
        curHexList.slice().forEach((hex, i) => {
            const y = nexPos.y + (i + 1) * Constant.HEX_SIZE_Y_H;
            const newPos = new Vec3(nexPos.x, y, nexPos.z);
            console.log('newPos', newPos);
            if (!hex) return;
            const t = tween(hex.node)
                .delay(0.1)
                .call(() => {
                    hex.moveNodeAction(newPos, () => { });
                });

            taskList.push(t);
            lastHex = hex.node;
        });

        if (!lastHex) {
            return this.runNextChangeGrid();
        }

        tween(lastHex).sequence(...taskList).call(() => {
            console.log(`移动第${index + 1}次`);
            // 移动下一个
            this.moveHexGridData(markGridList, index + 1);
        }).start();

        nexGrid.addHexList(curHexList);
        curGrid.clearTopHexList(curHexList.length);

        if (index === 0) {
            // 塞入变化的格子队列
            markGridList.forEach((item) => {
                this._changeGridQueue.push(item[0]);
            });
        }
    }

    /** 消除格子的方块 */
    clearHexGridData(hexGrid: HexGrid) {
        try {
            console.log('hexGrid', hexGrid);
            if (!hexGrid || !(hexGrid instanceof HexGrid) || hexGrid.isEmpty()) return;

            const lastHexList = hexGrid.getTopAllSame();
            const len = lastHexList.length;
            console.log('len', len, this.maxHexCount);
            if (len < this.maxHexCount || len === 0) {
                return;
            }
            let lastHex = null;
            let delNum = 0;
            const taskList = [];
            lastHexList.slice().forEach((hex, i) => {
                // if (!hex) {
                //     console.warn('销毁异常, i', i, lastHexList);
                //     return;
                // }
                
                // 两个异步
                const t = tween(hex.node)
                    .delay(0.1)
                    .call(() => {
                        hex.removeNodeAction(0.3, () => {
                            delNum++;
                        });
                    });

                taskList.push(t);
                lastHex = hex.node;
            });

            // 不靠谱
            tween(lastHex).sequence(...taskList).call(() => {
                // destroy过程中会发生异常，成功消除的数量不一定等于len
                console.log('消除格子', hexGrid, len, delNum);
                // if (len !== delNum) {
                //     hexGrid.delayCheckInvalidNode(1);
                // }
                if (len !== delNum) {// 再次强行删除
                    lastHexList.forEach(hex => {
                        if (hex && hex.node) {
                            hex.node.destroy();
                        }
                    });
                    this.checkAndDelInvalidNode(hexGrid);
                }

                hexGrid.clearTopHexList(len);
                Constant.hexGameManager.updateScore(len);

                this._clearCount += len;
                // 最后一个变动也要再次检测
                this._changeGridQueue.push(hexGrid);
                this.runNextChangeGrid();

            }).start();

            // const numNode = hexGrid.numNode;
            // if (numNode && numNode.active) {
            //     const numPos = numNode.position.clone();
            //     numPos.y = numPos.y - len * Constant.HEX_SIZE_Y_H;

            //     console.log('numPos', numPos);
            //     tween(numNode)
            //     .delay(0.1)
            //     .to(0.2, { position: numPos })
            //     .start();
            // }

            // // 任务队列
            // this.taskQueue(markGridList).then((data) => {
            //     console.log('clearHexGridData data', data);
            // });
            // this.runTaskQueue(markGridList, 0);
        } catch (e) {
            console.log('clearHexGridData e', e)
        }
    }

    async runTaskQueue(markGridList: (HexGrid | number)[], index: number) {
        if (index >= markGridList.length) return;
        const res = await this.checkHexGridData(markGridList[index][0]);
        console.log('runTaskQueue res', res)
        const delayTime = 0;
        tween(this._queue).delay(delayTime).call(() => {
            this.runTaskQueue(markGridList, index + 1);
        }).start();
    }

    /**
     * 标记相邻颜色相同的格子
     * @param row 
     * @param col 
     * @param texture 
     * @returns 
     */
    async checkSiblingGridSameColor(row: number, col: number, texture: string) {
        return new Promise((resolve, reject) => {
            console.log('checkSiblingGridSameColor row, col', row, col);
            if (!this.checkGridNotNull(row, col)) return resolve(-1);
            const hexGrid = this._gridList[row][col];
            if (!hexGrid || hexGrid.isEmpty()) return resolve(-1);
            if (!hexGrid.getTopHexType()) {
                // 强行清除非法数据
                this.checkAndDelInvalidNode(hexGrid, 0);
                return resolve(-1);
            }
            // 是否同材质
            if (hexGrid.getTopHexType() !== texture) return resolve(-1);
            // 是否标记过
            if (hexGrid.isMark) return resolve(-1);
            // 符合条件
            hexGrid.setIsMark(true);
            console.log('remark', texture);

            if (col % 2 === 1) {// 奇数
                // 以 (1,1)为例
                // 左上(1, 0)
                this.checkSiblingGridSameColor(row, col - 1, texture)
                // 右上(1, 2)
                this.checkSiblingGridSameColor(row, col + 1, texture)
                // 上(0, 1)
                this.checkSiblingGridSameColor(row - 1, col, texture)
                // 下(2, 1)
                this.checkSiblingGridSameColor(row + 1, col, texture)
                // 左下(2, 0)
                this.checkSiblingGridSameColor(row + 1, col - 1, texture)
                // 右下(2, 2)
                this.checkSiblingGridSameColor(row + 1, col + 1, texture)
            } else {// 偶数
                // 以 (1,2)为例
                // 左上(0,1)
                this.checkSiblingGridSameColor(row - 1, col - 1, texture)
                // 右上(0,3)
                this.checkSiblingGridSameColor(row - 1, col + 1, texture)
                // 上(0,2)
                this.checkSiblingGridSameColor(row - 1, col, texture)
                // 下(2,2)
                this.checkSiblingGridSameColor(row + 1, col, texture)
                // 左下(1,1)
                this.checkSiblingGridSameColor(row, col - 1, texture)
                // 右下(1,3)
                this.checkSiblingGridSameColor(row, col + 1, texture)
            }
            resolve(1);
        }).catch((e) => {
            console.log('e', e);
            return Promise.reject(e);
        });
    }

    checkGridNotNull(row: number, col: number) {
        if (row < 0 || row >= this._row
            || col < 0 || col >= this._col
            || !this._gridList[row] || !this._gridList[row][col]) return false
        return true
    }

    checkAndDelInvalidNode(hexGrid: HexGrid, delay: number = 1) {
        if (!hexGrid || !hexGrid.node) return;
        tween(hexGrid.node).delay(delay).call(() => {
            // 只要有非法节点存在，该格全部清空
            const topHex = hexGrid.getTopHex();
            console.log('检测非法节点 topHex', topHex, hexGrid);
            if ((topHex && !topHex.node) || !topHex) {// 非法或者空
                console.log('检查非法节点并清空')
                const gridPos = hexGrid.getPosition();
                const nodeList = Constant.hexManager.getHexNodeList();
                nodeList.forEach((node) => {
                    const pos = node.getPosition();
                    if (pos.x === gridPos.x && pos.z === gridPos.z) {
                        node.destroy();
                    }
                });
                hexGrid.setHexList([]);
                hexGrid.showNum();
            }
        }).start();
    }

    clearGridList() {
        this._gridList.forEach((list, i) => {
            (list || []).forEach((grid, j) => {
                if (!grid) return;
                grid.hideNum();
                if (grid && grid.node) {
                    grid.node.destroy();
                }
            })
        });
        this._gridList = [];
    }
}

