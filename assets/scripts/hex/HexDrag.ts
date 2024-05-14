import { _decorator, Component, Vec3, Node, isValid } from 'cc';
import { Constant } from '../util/Constant';
import { Hex } from './Hex';
import { Utils } from '../util/Utils';
const { ccclass, property } = _decorator;

@ccclass('HexDrag')
export class HexDrag extends Component {
    public hexList: Hex[] = [];
    public numNode: Node = null;

    private _originPos: Vec3 = null;
    private _isDragAbled: boolean = true;

    onLoad() {
        // this._originPos = this.node.position.clone();
    }


    start() {
        this._originPos = this.node.position.clone();
    }

    update(deltaTime: number) {
        
    }

    setDataProp(pos: Vec3, numNode: Node) {
        this._originPos = pos;
        this.numNode = numNode;
    }

    setDragAbled(isDragAbled: boolean) {
        this._isDragAbled = isDragAbled;
    }

    resetOriginPosition() {
        this.node.setPosition(this._originPos);
    }

    setPosition(pos: Vec3) {
        this.node.setPosition(pos);
    }

    getPosition() {
        return this.node.position;
    }

    setParent(parent: any) {
        this.node.setParent(parent);
    }

    setScale(x: number, y: number, z: number = 1) {
        this.node.setScale(x, y, z);
    }

    setHexList(hexList: any[]) {
        this.hexList = hexList;
    }

    getHexList() {
        return this.hexList;
    }

    getTopAllSameLength() {
        let len = this.hexList.length, k = 1
        if (!len) return 0;
        const top = this.hexList[len - 1]
        for(let i = len - 2; i >= 0; i--) {
            const hex = this.hexList[i]
            if (hex && top && hex.hexType === top.hexType) {
                k++
            } else {
                break
            }
        }
        return k;
    }

    showNum() {
        const num = this.getTopAllSameLength();
        if (!this.numNode) return;
        if (num < 1 || num > 20) {
            this.numNode.active = false;
            return;
        }

        const mPath = Utils.getNumMaterialPath(num);
        Utils.setMaterial(this.numNode, mPath);
        const pos = this.numNode.position.clone();
        pos.y = (this.hexList.length + 2) * Constant.HEX_SIZE_Y_H;
        this.numNode.setPosition(pos);
        this.numNode.active = true;
    }
}

