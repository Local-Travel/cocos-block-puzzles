import { _decorator, Component, Vec3 } from 'cc';
import { Constant } from '../util/Constant';
import { Hex } from './Hex';
const { ccclass, property } = _decorator;

@ccclass('HexDrag')
export class HexDrag extends Component {
    public hexList: Hex[] = [];

    private _originPos: Vec3 = null;
    private _isDragAbled: boolean = true;

    onLoad() {
        this._originPos = this.node.position.clone();
    }


    start() {

    }

    update(deltaTime: number) {
        
    }

    onDestroy() {}

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
}

