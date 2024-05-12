import { _decorator, Component, Node, Graphics, macro, Vec3, math, CCInteger, UITransform, v3, Prefab, Intersection2D, Vec2, instantiate, Size, Color, EventTouch, resources, Material, MeshRenderer } from 'cc';
import { Constant } from '../util/Constant';
import { Utils } from '../util/Utils';
import { Hex } from '../hex/Hex';
import { HexDragControl } from './HexDragControl';
import { HexGridManager } from './HexGridManager';
const { ccclass, property } = _decorator;

@ccclass('HexManager')
export class HexManager extends Component {
    @property(Prefab)
    hexPrefab: Prefab = null;
    @property(HexGridManager)
    hexGridManager: HexGridManager = null;
    @property(HexDragControl)
    hexDragControl: HexDragControl = null;

    private _hexList: Hex[] = [];
    private _hexSkinType: string = "";

    protected __preload(): void {
        Constant.hexManager = this;
    }

    onLoad() {
        this._hexSkinType = 'Style1'
    }

    start() {
        
    }

    init() {
        // 由gird调用执行      
        this.clearHexList();      
    }

    /** 批量生成多个指定位置的hex */
    generatePreHexList(list: number[], col: number) {
        const startPoint = Constant.HEX_GRID_START_POINT;
        const hexSize = Constant.HEX_SIZE;
        const row = Math.ceil(list.length / col);
        // 先清空所有hex
        this.clearHexList();
        for(let i = 0; i < row; i++){
            for(let j = 0; j < col; j++){
                const k = i * col + j;
                if (list[k] > 0) {
                    const pos = Utils.convertRowColToPosHexagon(i, j, hexSize, startPoint.x, startPoint.z);
                    this.batchGenerateHexList(list[k], pos);
                }
            }
        }
    }

    /** 生成单个六边形 */
    createHex(pos: Vec3, hexType: number) {
        const [path, name] = this.getHexType(hexType);
        const hexNode = instantiate(this.hexPrefab);
        hexNode.setPosition(pos);
        hexNode.setParent(this.node);
        this.setMaterial(hexNode, path);

        const hexComp = hexNode.getComponent(Hex);
        hexComp.setHexType(name);

        this._hexList.push(hexComp);

        return hexComp;
    }

    batchGenerateHexList(count: number, pos: Vec3, hexTypeList: number[] = [], skinLimitCount: number = 0) {
        const hexList: Hex[] = []
        let num = count, skinList = [];
        let len = hexTypeList.length;
        if (len > 0) {
            skinList = hexTypeList;
        } else {
            skinList = this.getSkinList(0, skinLimitCount);
        }
        len = skinList.length;
        let index = 0;
        for(let i = 0; i < len; i++) {
            const max = Math.floor(num / (len - i));
            const n = i !== len - 1 ? math.randomRangeInt(1, max + 1) : num;
            num -= n;
            for(let j = 0; j < n; j++) {
                const newPos = pos.clone();
                newPos.y = Utils.getListHexYH(index++);
                const hex = this.createHex(newPos, skinList[i]);
                hexList.push(hex);
            }
        }
        return hexList
    }

    getSkinList(count: number = 0, skinLimit: number = 0) {
        const skinObj = Constant.HEX_SKIN_TYPE[this._hexSkinType]
        let skinMaxCount = skinObj.skinNum;
        if (skinLimit > 0) {
            skinMaxCount = Math.min(skinMaxCount, skinLimit);
        }
        const skinCount = count > 0 ? count : math.randomRangeInt(1, skinMaxCount + 1);
        const skinList = []
        for(let i = 0; i < skinCount; i++) {
            const code = math.randomRangeInt(1, 100)
            skinList.push(code)
        }
        return skinList;
    }

    getHexType(hexType: number) {
        const skinObj = Constant.HEX_SKIN_TYPE[this._hexSkinType]
        let code = hexType % skinObj.skinNum
        code = code == 0 ? skinObj.skinNum : code
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

    getHexList() {
        return this._hexList;
    }

    clearHexList() {
        this._hexList.forEach(item => {
            if (item && item.node) {
                item.node.destroy();
            }
        });
        this._hexList = [];
    }
    
}


