import { _decorator, Color, Component, director, EventTouch, find, Graphics, math, Node, Rect, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { Constants } from './util/Constant';
const { ccclass, property } = _decorator;

@ccclass('Drag')
export class Drag extends Component {
    page: Node = null;
    target: Node = null;
    container: Node = null;
    blockList: any[] = [];
    blockPosList: Vec3[] = [];

    private _oldPos: Vec3 = null;
    private _rPos: Vec3 = null;
    private _targetRect: Rect = null;

    private _isDragAbled: boolean = true;
    private _dragReuslt: boolean | [Vec3, number[]] = false;

    onLoad() {
        this._oldPos = this.node.position.clone();
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.container = find('Canvas/PageGame/Main/DragContainer');
        this.target = find('Canvas/PageGame/Main/BoardBg/BoardNode');
        

        if (this.target) {
            this._targetRect = this.target.getComponent(UITransform).getBoundingBox();
        }
    }


    start() {
        // this.drawLine()
        this._dragReuslt = false
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
        const g = this.node.getComponent(Graphics);
        const { width, height } = this.node.getComponent(UITransform);
        const x = -width / 2;
        const y = -height / 2;
        g.lineWidth = 2;
        g.fillColor = Color.BLUE;
        g.fillRect(x, y, width, height)
        g.fill();
    }

    setBlockList(list: any[]) {
        this.blockList = list;
    }

    setBlockPosList(list: Vec3[]) {
        this.blockPosList = list;
    }

    onTouchStart(event:EventTouch) {
        
    }

    onTouchMove(event: EventTouch) {
        if (!this._isDragAbled || !this._targetRect) return;

        const touchPos = event.getLocation();
        const nPos = this.getNodeSpacePosition(touchPos);

        const rPos = this.getRelativePosition(new Vec2(nPos.x, nPos.y));
        const { x, y, width, height } = this._targetRect;
        const size = Constants.goBoard.gridSize;

        if (rPos.x < x + size / 2 
            || rPos.x > x + width - size / 2 
            || rPos.y > y + height - size / 2
            || nPos.y < 0) {
            console.log('超出范围');
            return;
        }

        this.node.setPosition(nPos);

        // console.log('targetRect', this._targetRect, rPos, nPos);
        if (this._targetRect.contains(v2(rPos.x, rPos.y))) {
            this.node.setScale(1, 1);
            this._dragReuslt = Constants.goBoard.checkDragPosition(this.blockPosList, v3(rPos.x, rPos.y));
            this._rPos = v3(rPos.x, rPos.y, 0);
        } else {
            this.node.setScale(0.5, 0.5);
            this._dragReuslt = false;
            this._rPos = null;
            Constants.goBoard.removeRectColor();
        }
    }

    onTouchEnd(event: EventTouch) {
        if (!this._isDragAbled) return;
        if (this._dragReuslt) {
            const offset = this._dragReuslt[0];
            const rowColList = this._dragReuslt[1];
            const newPos = new Vec3(this._rPos.x + offset.x, this._rPos.y + offset.y, 0);
            this.node.setPosition(newPos);

            Constants.goBoard.setFillPositionByIndex(rowColList, this.blockList);
            Constants.goBoard.checkBoardFull(rowColList);
            Constants.goBoard.removeRectColor();

            this.node.parent = this.target;
            this._isDragAbled = false;
            // 减少拖拽的方块数量
            director.emit(Constants.EVENT_TYPE.SUB_DRAG_BLOCK);

            // effect
            Constants.audioManager.play('water2');
        } else {
            console.log('恢复原来位置');
            // 恢复初始位置
            this.node.setPosition(this._oldPos);
            this.node.setScale(0.5, 0.5);
            this._isDragAbled = true;
            this._dragReuslt = false;
        }
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

