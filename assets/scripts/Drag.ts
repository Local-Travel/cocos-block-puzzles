import { _decorator, Component, EventTouch, math, Node, UITransform, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Drag')
export class Drag extends Component {
    @property(Node)
    target: Node = null;

    private _oldPos: Vec3 = null;
    private _uiTransform: UITransform = null;

    onLoad() {
        this._oldPos = this.node.position.clone();
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }


    start() {

    }

    update(deltaTime: number) {
        
    }

    onTouchMove(event: EventTouch) {
        const touchPos = event.getLocation();
        this._uiTransform = this.node.parent.getComponent(UITransform);
        const worldPos = this._uiTransform.convertToNodeSpaceAR(new Vec3(touchPos.x, touchPos.y, 0));
        this.node.setPosition(worldPos);
    }

    onTouchEnd(event: EventTouch) {
        const pos = event.getLocation();
        const location = new Vec3(pos.x, pos.y, 0)
        const targetRect = this.target.getComponent(UITransform).getBoundingBox();
        const point = this.target.parent.getComponent(UITransform).convertToNodeSpaceAR(location);
        const { width, height } = this.node.getComponent(UITransform);
        const nodeRect = new math.Rect(point.x, point.y, width, height);
        // TODO: 有问题，需要特别处理，找到特定的位置
        console.log('rect', targetRect, nodeRect);
        if (targetRect.containsRect(nodeRect)) {
           let p = this.target.getComponent(UITransform).convertToWorldSpaceAR(location);
           this.node.setPosition(p);
           this.node.parent = this.target;
        } else {
            console.log('恢复原来位置');
            // 恢复初始位置
            this.node.setPosition(this._oldPos);
        }
    }
}

