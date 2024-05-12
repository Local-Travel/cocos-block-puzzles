import { _decorator, CCInteger, Component, instantiate, Material, MeshRenderer, Node, Prefab, resources, Vec3 } from 'cc';
import { Constant } from '../util/Constant';
import { Utils } from '../util/Utils';
import { HexGrid } from './HexGrid';
const { ccclass, property } = _decorator;

@ccclass('HexGridManager')
export class HexGridManager extends Component {
    @property(Prefab)
    hexGridPrefab: Prefab = null;// 格子预制体

    @property({type: CCInteger})
    maxHexCount: number = 10;// 最大格子数量

    private _gridList: HexGrid[] = [];
    private _gridSkinType: string = "Style1";// 格子皮肤类型
    private _hexSkinCountLimit: number = 0;// 皮肤数量限制
    
    start() {

    }

    update(deltaTime: number) {
        
    }

    init(list: number[], col: number, skinCount: number) {
        this._hexSkinCountLimit = skinCount;
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
                const k = i * col + j;
                const pos = Utils.convertRowColToPosHexagon(i, j, gridSize, startPoint.x, startPoint.z);
                const hexGrid = this.generateGrid(pos);
                this._gridList.push(hexGrid);

                const skinType = list[k] < 0 ? list[k] : Constant.GRID_SKIN_PROPS.DEFAULT;
                this.setGridSkin(skinType, hexGrid);
                hexGrid.setType(skinType);
                hexGrid.setMaxHexCount(this.maxHexCount);
                
                if (list[k] > 0) {
                    const hexList = Constant.hexManager.batchGenerateHexList(list[k], pos, [], this._hexSkinCountLimit);
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

