import { _decorator, Color, Component, director, EventTouch, find, Graphics, math, Node, Rect, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { Constant } from '../util/Constant';
const { ccclass, property } = _decorator;

@ccclass('HexDrag')
export class HexDrag extends Component {
    private _blockList: any[] = [];
    private _blockPosList: Vec3[] = [];

    private _originPos: Vec3 = null;
    private _isDragAbled: boolean = true;

    onLoad() {
        // console.log('HexDrag onLoad') 
        this._originPos = this.node.position.clone();
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);    
    }


    start() {
        // this.drawLine();
    }

    update(deltaTime: number) {
        
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    drawLine() {
        console.log('this.node', this.node);
        const g = this.node.getChildByName('Graphics').getComponent(Graphics);
        const { width, height } = this.node.getComponent(UITransform);
        const x = -width / 2;
        const y = -height / 2;
        g.lineWidth = 2;
        g.fillColor = Color.BLUE;
        g.fillRect(x, y, width, height)
        g.fill();
    }

    setBlockList(list: any[]) {
        this._blockList = list;
    }

    getBlockList() {
        return this._blockList;
    }

    setBlockPosList(list: Vec3[]) {
        this._blockPosList = list;
    }

    getBlockPosList() {
        return this._blockPosList;
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

    setScale(x: number, y: number) {
        this.node.setScale(x, y);
    }

    setParent(parent: Node) {
        this.node.parent = parent;
    }

    onTouchStart(event: EventTouch) {
        // console.log('onTouchStart', this._isDragAbled);
        if (!this._isDragAbled) return;
        Constant.hexManager.handleTouchStart(event, this);
    }

    onTouchMove(event: EventTouch) {
        // console.log('onTouchMove', this._isDragAbled);
        if (!this._isDragAbled) return;
        Constant.hexManager.handleTouchMove(event, this);
    }

    onTouchEnd(event: EventTouch) {
        // console.log('onTouchEnd', this._isDragAbled);
        if (!this._isDragAbled) return;
        Constant.hexManager.handleTouchEnd(event, this);
    }

    getNodeSpacePosition(pos: Vec2) {
        const p = new Vec3(pos.x, pos.y, 0)
        return this.node.parent.getComponent(UITransform).convertToNodeSpaceAR(p);
    }

    getRelativePosition(pos: Vec2) {
        const p = new Vec3(pos.x, pos.y, 0)
        const parentPos = this.node.parent.position
        return new Vec3(parentPos.x + p.x, parentPos.y + p.y, 0);
    }
}

