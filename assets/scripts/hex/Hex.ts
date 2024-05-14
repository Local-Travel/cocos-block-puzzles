import { _decorator, Component, tween, v3, Vec3, Node, bezier } from 'cc';
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

    playFruitAction(endPos: Vec3, callback: Function) {
        const startPos = this.node.position;
        const startAngle = this.node.eulerAngles;
        const mixZ = 6;
        const maxZ = 12;
        const mixX = 1;
        const maxX = 5;
        const progressX = function (start, end, current, t) {
            current = bezier(start, mixX, maxX, end, t);
            return current;
        };
        const progressZ = function (start, end, current, t) {
            current = bezier(start, mixZ, maxZ, end, t);
            return current;
        };

        tween(startPos).parallel(
            tween().to(0.8,
                { x: endPos.x },
                {
                    progress: progressX, easing: "smooth",
                    onUpdate: () => {
                        this.node.setPosition(startPos);
                    }
                }),
            tween().to(0.8, { z: endPos.z }, {
                progress: progressZ, easing: "smooth", onUpdate: () => {
                    this.node.setPosition(startPos);
                }
            }),
        ).start();

        tween(startAngle).to(0.3, { z: 360 }, {
            onUpdate: () => {
                this.node.eulerAngles = startAngle;
            }
        }).call(() => {
            // 振动效果
            Utils.vibrateShort();
            callback();
        }).start();

    }

    /** 移除动画 */
    removeNodeAction(callback: Function) {
        const t = tween(this.node).to(0.3, { scale: v3(0, 0, 0) }).call(() => {
            // 振动效果
            Utils.vibrateShort();
            this.node.destroy();
            callback();
        });
        t.start();
    }

    /** 转移动画 */
    moveNodeAction(pos: Vec3, callback: Function) {
        tween(this.node).to(0.3, { position: pos, angle: 360 }).call(() => {
            // 振动效果
            Utils.vibrateShort();
            callback();
        }).start();
    }
}

