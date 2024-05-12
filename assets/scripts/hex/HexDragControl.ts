import { _decorator, Camera, CCInteger, Collider, Component, director, EventTouch, geometry, input, Input, instantiate, ITriggerEvent, math, Node, PhysicsSystem, Prefab, Rect, Size, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { BlockData } from '../data/BlockData';
import { Constant } from '../util/Constant';
import { HexDrag } from './HexDrag';
import { Utils } from '../util/Utils';
import { HexGridManager } from './HexGridManager';
import { HexGrid } from './HexGrid';
const { ccclass, property } = _decorator;

@ccclass('HexDragControl')
export class HexDragControl extends Component {
    @property(Prefab)
    dragNodePrefab: Prefab = null!;

    @property({ type: Camera })
    camera: Camera = null!;

    @property({ type: CCInteger })
    blockCount: number = 3;

    @property(HexGridManager)
    hexGridManager: HexGridManager = null!;

    private _blockNum: number = 0;
    private _hexSkinCountLimit: number = 0;

    private _moveDrag: HexDrag = null;
    private _lastHexGrid: HexGrid = null;
    private _dragReuslt: null | [Vec3, Node] = null;

    protected onEnable(): void {
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    protected onDisable(): void {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchEnd, this);
    }

    start() {
        
    }

    update(deltaTime: number) {
        
    }

    init(skinCount: number) {
        this._hexSkinCountLimit = skinCount;
        this._blockNum = this.blockCount;
        this.generateDragList();
    }

    substractCount() {
        this._blockNum--;
        if (this._blockNum <= 0) {
            this._blockNum = this.blockCount;
            this.generateDragList();
        }
    }

    generateDragList() {
        const hexCount = math.randomRangeInt(1, this.hexGridManager.maxHexCount);
        const hexSkinList = [];
        this.generateDragHexs(hexCount, hexSkinList);
    }

    generateDragHexs(hexCount: number, hexSkinList: number[]) {
        const startPoint = Constant.HEX_DRAG_START_POINT;

        for(let j = 0; j < this.blockCount; j++){
            const space = Math.abs(startPoint.x);
            const pos = new Vec3(startPoint.x + space * j, startPoint.y, startPoint.z);
            const hexDrag = this.generateDrag(pos);
            
            const hexList = Constant.hexManager.batchGenerateHexList(hexCount, pos, hexSkinList, this._hexSkinCountLimit);
            hexDrag.setHexList(hexList);

            hexList.forEach((hex) => {
                hex.setPosition(new Vec3(0, hex.getPosition().y, 0));
                hex.setParent(hexDrag.node);
            });

            // console.log('generateDragHexs', hexDrag);
        }
    }

    /** 生成格子 */
    generateDrag(pos: Vec3) {
        const dragNode = instantiate(this.dragNodePrefab);
        dragNode.setPosition(pos);
        dragNode.setParent(this.node);
        dragNode.active = true;
        
        const hexDragComp = dragNode.getComponent(HexDrag);
        return hexDragComp;
    }

    removeHexGridSkin() {
        if (this._lastHexGrid) {
            Constant.hexGridManager.setGridSkin(0, this._lastHexGrid);
        }
    }

    setHexGridSkin(hexGrid: HexGrid) {
        if (!hexGrid) return;
        if (this._lastHexGrid) {
            if (this._lastHexGrid.uuid === hexGrid.uuid) return;
            this.removeHexGridSkin();
        }
        Constant.hexGridManager.setGridSkin(1, hexGrid);
    }

    onTouchStart(event: EventTouch) {
        // this._startPos = drag.getPosition();
        this._moveDrag = null;
    }

    onTouchMove(event: EventTouch) {
        let ray = this.camera.screenPointToRay(event.getLocationX(), event.getLocationY())

        if (PhysicsSystem.instance.raycastClosest(ray)) {
            const res = PhysicsSystem.instance.raycastClosestResult
            const hitNode = res.collider.node
            // console.log('hitNode', hitNode)
            if (hitNode.name.startsWith(Constant.CollisionType.DRAG_NAME)) {
                console.log('击中目标')
                // hitPoint
                const hitPoint: Vec3 = res.hitPoint;
                const drag = hitNode.getComponent(HexDrag);
                drag.setPosition(new Vec3(hitPoint.x, 0, hitPoint.z));
                const hexGrid = Constant.hexGridManager.getGridByPos(hitPoint);
                console.log('hitPoint, hexGrid', hitPoint, hexGrid);
                this.setHexGridSkin(hexGrid);
                this._lastHexGrid = hexGrid;
                this._dragReuslt = [hitPoint, hitNode];
                this._moveDrag = drag;
            } else {
                this.removeHexGridSkin();
            }
        } else {
            console.log('射线不包含')
            this._dragReuslt = null;
            this.removeHexGridSkin();
        }

        // // TODO: 判断撞击网格回掉

        // const nPos = drag.getNodeSpacePosition(touchPos);

        // const rPos = drag.getRelativePosition(new Vec2(nPos.x, nPos.y));
        // const { x, y, width, height } = this._targetRect;
        // const size = Constant.hexManager.gridSize;

        // if (rPos.x < x + size / 2 
        //     || rPos.x > x + width - size / 2 
        //     || rPos.y > y + height - size / 2
        //     || nPos.y < 0) {
        //     console.log('超出范围');
        //     return;
        // }

        // drag.setPosition(nPos);

        // console.log('targetRect', this._targetRect, rPos, nPos);
        // if (this._targetRect.contains(v2(rPos.x, rPos.y))) {
        //     drag.setScale(1, 1);
        //     this._dragReuslt = Constant.hexManager.checkDragPosition(drag.getBlockPosList(), v3(rPos.x, rPos.y));
        //     this._rPos = v3(rPos.x, rPos.y, 0);
        // } else {
        //     drag.setScale(0.5, 0.5);
        //     this._dragReuslt = false;
        //     this._rPos = null;
        //     Constant.hexManager.removeRectColor();
        // }
    }

    onTouchEnd(event: EventTouch) {
        console.log('this._lastHexGrid', this._lastHexGrid)
        if (this._dragReuslt && this._lastHexGrid) {
            // TODO
            // this.substractCount();
            this.removeHexGridSkin();
        } else {
            console.log('恢复原来位置');
            this._moveDrag?.resetOriginPosition();
        }
    }
}

