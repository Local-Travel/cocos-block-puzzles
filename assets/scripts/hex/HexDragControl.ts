import { _decorator, Camera, CCInteger, Collider, Component, director, EventTouch, geometry, input, Input, instantiate, ITriggerEvent, math, Node, PhysicsSystem, Prefab, Rect, Size, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
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
    private _hexSkinCountMax: number = 0;
    private _hexSkinCountLimit: number = 0

    private _moveDrag: HexDrag = null;
    private _lastHexGrid: HexGrid = null;

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

    init(skinCount: number, createSkinCount: number) {
        this._hexSkinCountMax = skinCount;
        this._hexSkinCountLimit = createSkinCount;
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
        this.generateDragHexs(hexCount);
    }

    /** 批量生成拖拽节点 */
    generateDragHexs(hexCount: number) {
        const startPoint = Constant.HEX_DRAG_START_POINT;

        for(let j = 0; j < this.blockCount; j++){
            const space = Math.abs(startPoint.x);
            const pos = new Vec3(startPoint.x + space * j, startPoint.y, startPoint.z);
            const hexDrag = this.generateDrag(pos);
            
            const hexList = Constant.hexManager.batchGenerateHexList(hexCount, pos, this._hexSkinCountLimit, this._hexSkinCountMax);
            hexDrag.setHexList(hexList);

            hexList.forEach((hex) => {
                hex.setPosition(new Vec3(0, hex.getPosition().y, 0));
                hex.setParent(hexDrag.node);
            });

            // console.log('generateDragHexs', hexDrag);
        }
    }

    /** 生成拖拽节点 */
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
                this._moveDrag = drag;

                const hexGrid = Constant.hexGridManager.getGridByPos(hitPoint);
                console.log('hitPoint, hexGrid', hitPoint, hexGrid);
                if (hexGrid && hexGrid.isActive() && hexGrid.isEmpty()) {
                    this.setHexGridSkin(hexGrid);
                    this._lastHexGrid = hexGrid;
                    return;
                }
            }
        } else {
            console.log('射线不包含')
        }
        this.removeHexGridSkin();
        this._lastHexGrid = null;
    }

    onTouchEnd(event: EventTouch) {
        console.log('this._lastHexGrid', this._lastHexGrid)
        if (this._lastHexGrid && this._moveDrag) {
            // TODO
            this.substractCount();
            const hexList = this._moveDrag.getHexList();

            const result = Constant.hexGridManager.setGridHexList(this._lastHexGrid, hexList);
            if (result) {
                this._moveDrag.node.destroy();
            }
        } else {
            console.log('恢复原来位置');
            if (this._moveDrag) {
                this._moveDrag.resetOriginPosition();
            }
        }
        this.removeHexGridSkin();
        this._lastHexGrid = null;
    }
}

