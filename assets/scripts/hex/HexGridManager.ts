import { _decorator, CCInteger, Component, instantiate, Material, MeshRenderer, Node, Prefab, resources, tween, Vec3 } from 'cc';
import { Constant } from '../util/Constant';
import { Utils } from '../util/Utils';
import { HexGrid } from './HexGrid';
import { Hex } from './Hex';
const { ccclass, property } = _decorator;

@ccclass('HexGridManager')
export class HexGridManager extends Component {
    @property(Prefab)
    hexGridPrefab: Prefab = null;// 格子预制体

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
                }
            }
        }
    }

    /** 生成格子 */
    generateGrid(pos: Vec3) {
        const hexGridNode = instantiate(this.hexGridPrefab);
        hexGridNode.setPosition(pos);
        hexGridNode.setParent(this.node);

        const hexGridComp = hexGridNode.getComponent(HexGrid);
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
            hexList.forEach(hex => {
                const oldPos = hex.getPosition();
                const newPos = new Vec3(pos.x, oldPos.y, pos.z);
                hex.setPosition(newPos);
                hex.resetOriginParent();
            });
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

    /** 消除格子中同颜色的六边形 */
    removeHexGridData(hexGrid: HexGrid) {
        const index = this._gridList.findIndex(item => item.uuid === hexGrid.uuid);
        // 根据index反推行列
        const [row, col] = this.getRowColByIndex(index);
        // 颜色纹理
        const texture = hexGrid.getTopHexType();
        // 标记
        this.checkSiblingGridSameColor(row, col, texture);

        // 获取标记的格子列表
        const markGridList = this._gridList.filter((item, index) => {
            return item.isMark
        });
        // 消除标记
        markGridList.forEach(item => {
            item.setIsMark(false);
        });

        console.log('markGridList', markGridList);

        if (markGridList.length < 2) return;

        // 转移
        // let moveTaskList = [];
        let pre = markGridList[0];
        for (let i = 1; i < markGridList.length; i++) {
            const item = markGridList[i];
            const topHex = item.getTopHex();
            const pos = topHex.getPosition().clone();
            const preHexList = pre.getTopAllSame();

            // preHexList.forEach((hex, index) => {
            //     const newPos = new Vec3(pos.x, pos.y + (index + 1) * Constant.HEX_SIZE_Y_H, pos.z);
            //     moveTaskList.push(hex.moveNodeTask(newPos));
            // })
            console.log('pos', pos);
            preHexList.forEach((hex, index) => {
                const newPos = new Vec3(pos.x, pos.y + (index + 2) * Constant.HEX_SIZE_Y_H, pos.z);
                console.log('newPos', newPos);
                hex.moveNodeAction(newPos);
            });
            item.addHexList(preHexList);
            pre.clearTopHexList(preHexList.length);
            // 重新下一个转移
            pre = item;
        }
        // tween(pre.node).sequence(...moveTaskList).call(() => {
        //     console.log('移动');
        // }).start();

        // 消除
        const lastHexGrid = pre;
        const lastHexList = lastHexGrid.getTopAllSame();
        const len = lastHexList.length;
        console.log('len', len);
        if (len >= this.maxHexCount) {
            const taskList = []
            lastHexList.forEach(hex => {
                taskList.push(hex.removeNodeTask());
            });
            const hexNode = lastHexList[len - 1].node;
            console.log('hexNode', hexNode, taskList)
            const list = taskList.reverse();
            tween(hexNode).sequence(...list).call(() => {
                console.log('消除', hexNode);
                lastHexGrid.clearTopHexList(len);
                Constant.hexGameManager.updateScore(len);
            }).start();
        }

        // 重新设置位置和parent
        for (let i = 0; i < markGridList.length - 1; i++) {
            // 重新检测发生变动的格子
            this.removeHexGridData(markGridList[i]);
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
        // console.log('row, col', row, col, hexGrid.getTopHex());
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

