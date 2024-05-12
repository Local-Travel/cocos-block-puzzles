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

    /** 生成单个六边形 */
    createHex(pos: Vec3, hexType: number) {
        const [path, name] = this.getHexType(hexType);
        const hexNode = instantiate(this.hexPrefab);
        hexNode.setPosition(pos);
        hexNode.setParent(this.node);
        this.setMaterial(hexNode, path);

        const hexComp = hexNode.getComponent(Hex);
        hexComp.setHexType(name);
        hexComp.setOriginParent(this.node);

        this._hexList.push(hexComp);

        return hexComp;
    }

    batchGenerateHexList(count: number, pos: Vec3, skinLimitCount: number = 0, skinMaxCount: number = 0) {
        const hexList: Hex[] = []
        let num = count, skinList = [];
        let len = skinLimitCount;
        skinList = this.getSkinList(skinLimitCount, skinMaxCount);
        len = skinLimitCount > 0 ? Math.min(skinList.length, skinLimitCount) : skinList.length;
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
            let rand = math.randomRangeInt(1, 100);
            rand = rand % (skinMaxCount + 1);
            skinList.push(rand);
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


