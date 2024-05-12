import { _decorator, CCInteger, Component, instantiate, Material, MeshRenderer, Node, Prefab, resources, Vec3 } from 'cc';
import { Constant } from '../util/Constant';
import { Utils } from '../util/Utils';
import { HexGrid } from './HexGrid';
import { Hex } from './Hex';
const { ccclass, property } = _decorator;

@ccclass('HexGridManager')
export class HexGridManager extends Component {
    @property(Prefab)
    hexGridPrefab: Prefab = null;// 格子预制体

    @property({type: CCInteger})
    maxHexCount: number = 10;// 最大格子数量

    private _gridList: HexGrid[] = [];
    private _gridSkinType: string = "Style1";// 格子皮肤类型
    private _hexSkinCountMax: number = 0;
    private _hexSkinCountLimit: number = 0
    private _col = 0;// 列数

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
        this.draw3DHexGrid(list, col);
    }

    /** 绘制3D格子 */
    draw3DHexGrid(list: number[], col: number) {
        const startPoint = Constant.HEX_GRID_START_POINT;
        const gridSize = Constant.HEX_SIZE;
        const row = Math.ceil(list.length / col);

        this.clearGridList();
        for(let i = 0; i < row; i++){
            for(let j = 0; j < col; j++){
                const k = this.getIndex(i, j);
                const pos = Utils.convertRowColToPosHexagon(i, j, gridSize, startPoint.x, startPoint.z);
                const hexGrid = this.generateGrid(pos);
                this._gridList.push(hexGrid);

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

    getGridByPos(pos: Vec3) {
        const startPoint = Constant.HEX_GRID_START_POINT;
        const [row, col] = Utils.convertPosToRowColHexagon(pos, Constant.HEX_SIZE, startPoint.x, startPoint.z);
        if (row < 0 || row >= this._gridList.length || col < 0 || col >= this._col) {
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

