import { _decorator, Component, tween, v3, Vec3 } from 'cc';
import { Constant } from '../util/Constant';
import { Utils } from '../util/Utils';
const { ccclass, property } = _decorator;

@ccclass('Hex')
export class Hex extends Component {

    // 类型
    public hexType: string = '';

    private _originParent: any = null;

    start() {

    }

    update(deltaTime: number) {
        
    }

    setPosition(pos: Vec3) {
        this.node.setPosition(pos);
    }

    getPosition() {
        return this.node.position;
    }

    resetOriginParent() {
        if (this._originParent == null) return false;
        this.setParent(this._originParent);
        return true;
    }

    setOriginParent(parent: any) {
        this._originParent = parent;
    }

    setParent(parent: any) {
        this.node.setParent(parent);
    }

    setHexType(hexType: string) {
        this.hexType = hexType;
    }

    /** 移除动画 */
    removeNodeAction(callback: Function = () => {}) {
        const t = this.removeNodeTask(callback);
        t.start();
    }

    removeNodeTask(callback: Function = () => {}) {
        return tween(this.node).to(0.3, { scale: v3(0, 0, 0) }).call(() => { 
            // 振动效果
            Utils.vibrateShort();           
            this.node.destroy();
            callback();
        });
    }

    /** 转移动画 */
    moveNodeAction(pos: Vec3, callback: Function = () => {}) {
        tween(this.node).to(0.3, { position: pos, angle: 180 }).call(() => {
            // 振动效果
            Utils.vibrateShort(); 
            callback();
        }).start();
    }

    moveNodeTask(pos: Vec3, callback: Function = () => {}) {
        return tween(this.node).to(0.3, { position: pos, angle: 180 }).call(() => {
            // 振动效果
            Utils.vibrateShort(); 
            callback();
        });
    }
}

