import { _decorator, CCInteger, Component, instantiate, isValid, Material, MeshRenderer, Node, Prefab, resources, tween, Vec3 } from 'cc';
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

    private _gridList: HexGrid[] = [];
    private _gridSkinType: string = "Style1";// 格子皮肤类型
    private _hexSkinCountMax: number = 0;
    private _hexSkinCountLimit: number = 0
    private _col = 0;// 列数
    private _row = 0;// 行数
    private _startPoint: Vec3 = new Vec3();// 左下角，格子起始点

    protected __preload(): void {
        Constant.hexGridManager = this;
    }

    start() {

    }

    update(deltaTime: number) {

    }

    init(list: number[], col: number, skinCount: number, createSkinCount: number) {
        this._hexSkinCountMax = skinCount;
        this._hexSkinCountLimit = createSkinCount;
        this._col = col;
        this._row = Math.ceil(list.length / col);
        this._startPoint = Utils.getLeftBottomPoint(this._row, this._col);
        this.draw3DHexGrid(list);
    }

    /** 绘制3D格子 */
    draw3DHexGrid(list: number[]) {
        const startPoint = this._startPoint;
        const gridSize = Constant.HEX_SIZE;

        this.clearGridList();

        // 左下角开始遍历
        for (let i = 0; i < this._row; i++) {
            for (let j = 0; j < this._col; j++) {
                const k = this.getIndex(i, j);
                const pos = Utils.convertRowColToPosHexagon(i, j, gridSize, startPoint.x, startPoint.z);
                const hexGrid = this.generateGrid(pos);
                this._gridList[k] = hexGrid;

                const skinType = list[k] < 0 ? list[k] : Constant.GRID_SKIN_PROPS.DEFAULT;
                this.setGridSkin(skinType, hexGrid);
                hexGrid.setType(skinType);
                hexGrid.setMaxHexCount(this.maxHexCount);

                if (list[k] > 0) {
                    const hexList = Constant.hexManager.batchGenerateHexList(list[k], pos, this._hexSkinCountLimit, this._hexSkinCountMax);
                    hexGrid.setHexList(hexList);

                    hexGrid.showNum();
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
        const skinObj = Constant.GRID_SKIN_TYPE[this._gridSkinType]
        const code = skinType < 0 ? Constant.GRID_SKIN_PROPS.VEDIO : (skinType % skinObj.skinNum);
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
        console.log('行列', row, col);
        if (row < 0 || row >= this._row || col < 0 || col >= this._col) {
            console.log('超出范围');
            return null;
        }
        const index = this.getIndex(row, col);
        if (index < 0 || index >= this._gridList.length) return null;
        return this._gridList[index];
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
        console.log('checkHexGridData', hexGrid);
        if (!hexGrid || !(hexGrid instanceof HexGrid) || hexGrid.isEmpty()) return;
        const index = this._gridList.findIndex(item => item.node.uuid === hexGrid.node.uuid);
        // 根据index反推行列
        const [row, col] = this.getRowColByIndex(index);
        // 颜色纹理
        const texture = hexGrid.getTopHexType();
        // 标记
        this.checkSiblingGridSameColor(row, col, texture);

        // 获取标记的格子列表
        const markGridList = []
        this._gridList.forEach((item, index) => {
            if (item.isMark) {
                const [row, col] = this.getRowColByIndex(index);
                console.log('标记格子', index, row, col);
                markGridList.push([item, row, col]);
                // 消除标记
                item.setIsMark(false);
            }
            return item.isMark
        });

        console.log('markGridList length', markGridList.length);

        if (markGridList.length < 2) return;

        // 转移
        this.moveHexGridData(markGridList, 0);
    }

    /** 移动格子的方块 */
    moveHexGridData(markGridList: (HexGrid | number)[], index: number) {
        const n = markGridList.length;
        if (index >= n - 1) {
            const last = markGridList[n - 1];
            console.log('移动完成 row, col', last[1], last[2]);
            // 消除
            this.removeHexGridData(last[0], markGridList);
            return;
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
            const t = tween(hex.node)
            .delay(0.2)
            .call(() => {
               hex.moveNodeAction(newPos, () => {});
            });

            taskList.push(t);
            lastHex = hex.node;         
        });

        tween(lastHex).sequence(...taskList).call(() => {
            nexGrid.addHexList(curHexList);
            curGrid.clearTopHexList(curHexList.length);

            // 移动下一个
            this.moveHexGridData(markGridList, index + 1);
        }).start();
    }

    /** 消除格子的方块 */
    removeHexGridData(hexGrid: HexGrid, markGridList: (HexGrid | number)[]) {
        if (!hexGrid || !(hexGrid instanceof HexGrid) || hexGrid.isEmpty()) return;
        const lastHexList = hexGrid.getTopAllSame();
        const len = lastHexList.length;
        console.log('len', len, this.maxHexCount);
        if (len >= this.maxHexCount) {
            // const taskList = []
            let lastHex = null;
            const taskList = [];
            lastHexList.slice().forEach((hex, i) => {
                const t = tween(hex.node)
                .delay(0.1)
                .call(() => {
                    hex.removeNodeAction(() => {});
                });

                taskList.push(t);
                lastHex = hex.node; 
            });

            tween(lastHex).sequence(...taskList).call(() => {
                hexGrid.clearTopHexList(len);
                Constant.hexGameManager.updateScore(len);

                // 重新设置位置和parent
                for (let i = 0; i < markGridList.length; i++) {
                    // 重新检测发生变动的格子
                    this.checkHexGridData(markGridList[i][0]);
                }
            }).start();
        }
    }

    /**
     * 标记相邻颜色相同的格子
     * @param row 
     * @param col 
     * @param texture 
     * @returns 
     */
    checkSiblingGridSameColor(row: number, col: number, texture: string) {
        if (!this.checkGridNotNull(row, col)) return;
        const index = this.getIndex(row, col);
        const hexGrid = this._gridList[index];
        if (!hexGrid || hexGrid.isEmpty() || !hexGrid.getTopHexType()) return;
        // 是否同材质
        if (hexGrid.getTopHexType() !== texture) return;
        // 是否标记过
        if (hexGrid.isMark) return;
        console.log('checkSiblingGridSameColor row, col', row, col);
        // 符合条件
        hexGrid.setIsMark(true);

        if (col % 2 === 1) {
            // 左上
            this.checkSiblingGridSameColor(row - 1, col - 1, texture)
            // 右上
            this.checkSiblingGridSameColor(row - 1, col + 1, texture)
            // 上
            this.checkSiblingGridSameColor(row - 1, col, texture)
            // 下
            this.checkSiblingGridSameColor(row + 1, col, texture)
            // 左下
            this.checkSiblingGridSameColor(row, col - 1, texture)
            // 右下
            this.checkSiblingGridSameColor(row, col + 1, texture)
        } else {
            // 左上
            this.checkSiblingGridSameColor(row, col - 1, texture)
            // 右上
            this.checkSiblingGridSameColor(row, col + 1, texture)
            // 上
            this.checkSiblingGridSameColor(row - 1, col, texture)
            // 下
            this.checkSiblingGridSameColor(row + 1, col, texture)
            // 左下
            this.checkSiblingGridSameColor(row + 1, col - 1, texture)
            // 右下
            this.checkSiblingGridSameColor(row + 1, col + 1, texture)
        }
    }

    checkGridNotNull(row: number, col: number) {
        if (row < 0 || row >= this._row || col < 0 || col >= this._col) return false
        return true
    }

    getGridList() {
        return this._gridList;
    }

    clearGridList() {
        this._gridList.forEach(item => {
            if (item && item.node) {
                item.node.destroy();
            }
        });
        this._gridList = [];
    }
}

