import { _decorator, Camera, CCInteger, Collider, Component, director, EventTouch, geometry, input, Input, instantiate, ITriggerEvent, math, Node, PhysicsSystem, Prefab, Quat, Rect, Size, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
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

    @property(Prefab)
    numPrefab: Prefab = null!;

    @property({ type: Camera })
    camera: Camera = null!;

    @property({ type: CCInteger })
    dragCount: number = 3;

    @property(Node)
    gridNode: Node = null!;

    @property(HexGridManager)
    hexGridManager: HexGridManager = null!;

    private _dragNum: number = 0;
    private _hexSkinCountMax: number = 0;
    private _hexSkinCountLimit: number = 0;
    private _RotaValue: number = 0;

    private _moveDrag: HexDrag = null;
    private _lastHexGrid: HexGrid = null;
    private _dragList: HexDrag[] = [];

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
        this._dragNum = this.dragCount;
        this._moveDrag = null;
        this._lastHexGrid = null;
        this.clearDragList();
        this.generateDragList();
    }

    substractCount() {
        if (Constant.hexGameManager.gameStatus !== Constant.GAME_STATE.GAME_PLAYING) return;

        this._dragNum--;
        if (this._dragNum <= 0) {
            this._dragNum = this.dragCount;
            this.generateDragList();
        }
    }

    generateDragList() {
        const maxCount = this.hexGridManager.maxHexCount;
        const hexCount = math.randomRangeInt(1, maxCount);
        this.generateDragHexs(hexCount);
    }

    /** 批量生成拖拽节点 */
    generateDragHexs(hexCount: number) {
        const startPoint = Constant.HEX_DRAG_START_POINT;

        for(let j = 0; j < this.dragCount; j++){
            const space = Math.abs(startPoint.x);
            const pos = new Vec3(startPoint.x + space * j, startPoint.y, startPoint.z);
            const hexDrag = this.generateDrag(pos);
            
            const hexList = Constant.hexManager.batchGenerateHexList(hexCount, pos, this._hexSkinCountLimit, this._hexSkinCountMax);
            hexDrag.setHexList(hexList);

            hexList.forEach((hex) => {
                hex.setPosition(new Vec3(0, hex.getPosition().y, 0));
                hex.setParent(hexDrag.node);
            });

            hexDrag.showNum();
            this._dragList.push(hexDrag);
            // console.log('generateDragHexs', hexDrag);
        }
    }

    /** 生成拖拽节点 */
    generateDrag(pos: Vec3) {
        const dragNode = instantiate(this.dragNodePrefab);
        dragNode.setPosition(pos);
        dragNode.setParent(this.node);
        dragNode.active = true;

        const numNode: Node = instantiate(this.numPrefab);
        numNode.setPosition(Vec3.ZERO);
        numNode.setParent(dragNode);
        numNode.active = false;
        
        const hexDragComp = dragNode.getComponent(HexDrag);
        hexDragComp.setDataProp(pos, numNode);
        return hexDragComp;
    }

    removeHexGridSkin() {
        if (this._lastHexGrid) {
            Constant.hexGridManager.setGridSkin(0, this._lastHexGrid);
        }
    }

    setHexGridSkin(hexGrid: HexGrid) {
        this.removeHexGridSkin();
        Constant.hexGridManager.setGridSkin(1, hexGrid);
    }

    isMoveDrag(dragNode: Node) {
        if (!this._moveDrag) return true;
        return this._moveDrag.node.uuid === dragNode.uuid;
    }

    rotateTarget(event: EventTouch) {
        let delta = event.getDelta();
    
        if (delta.x > 0) {
            this._RotaValue += 10;
        } else {
            this._RotaValue -= 10;  
        }
        this._RotaValue = this._RotaValue % 360;


        // console.log('worldPos, worldRota', this.gridNode.worldPosition, this.gridNode.worldRotation);

        if (this.gridNode && this.gridNode.children) {
            for(let i = 0; i < this.gridNode.children.length; i++) {
                const child = this.gridNode.children[i];
                if (child.name === Constant.CollisionType.GRID_NAME) {
                    const eulerAngles = child.eulerAngles;
                    const y = this._RotaValue;
                    child.eulerAngles = new Vec3(eulerAngles.x, y, eulerAngles.z);
                }
            }
        }
    }

    onTouchStart(event: EventTouch) {
        if (Constant.hexGameManager.gameStatus !== Constant.GAME_STATE.GAME_PLAYING) return;
    }

    onTouchMove(event: EventTouch) {
        if (Constant.hexGameManager.gameStatus !== Constant.GAME_STATE.GAME_PLAYING) return;

        let ray = this.camera.screenPointToRay(event.getLocationX(), event.getLocationY())

        if (PhysicsSystem.instance.raycastClosest(ray)) {
            const res = PhysicsSystem.instance.raycastClosestResult
            const hitNode = res.collider.node
            // console.log('hitNode', hitNode)
            if (hitNode.name.startsWith(Constant.CollisionType.DRAG_NAME) && this.isMoveDrag(hitNode)) {
                // console.log('击中目标')
                // hitPoint
                const hitPoint: Vec3 = res.hitPoint;
                const drag = hitNode.getComponent(HexDrag);
                drag.setPosition(new Vec3(hitPoint.x, 0, hitPoint.z));
                this._moveDrag = drag;
                // 由于拖拽的相机和地图的相机不是同一个，因此需要减去模型大小的影响
                const pos = hitPoint.clone();
                pos.z -= 2 * Constant.HEX_SIZE;

                const hexGrid = Constant.hexGridManager.getGridByPos(pos);
                console.log('hitPoint, hexGrid', hitPoint, hexGrid);
                if (hexGrid && hexGrid.isActive() && hexGrid.isEmpty()) {
                    this.setHexGridSkin(hexGrid);
                    this._lastHexGrid = hexGrid;
                    return;
                }
            } else if (hitNode.name === Constant.CollisionType.GRID_NAME && !this._moveDrag) {
                // this.rotateTarget(event);
            }
        } else {
            console.log('射线不包含')
        }
        this.removeHexGridSkin();
        this._lastHexGrid = null;
    }

    onTouchEnd(event: EventTouch) {
        if (Constant.hexGameManager.gameStatus !== Constant.GAME_STATE.GAME_PLAYING) return;

        // console.log('this._lastHexGrid', this._lastHexGrid)
        if (this._lastHexGrid && this._moveDrag) {
            this.substractCount();
            const hexList = this._moveDrag.getHexList();

            const result = Constant.hexGridManager.setGridHexList(this._lastHexGrid, hexList);
            if (result) {
                this._moveDrag.node.destroy();
            }
            // 检测相邻格子并消除
            Constant.hexGridManager.checkHexGridData(this._lastHexGrid);
        } else {
            console.log('恢复原来位置');
            if (this._moveDrag) {
                this._moveDrag.resetOriginPosition();
            }
        }
        this.removeHexGridSkin();
        this._lastHexGrid = null;
        this._moveDrag = null;
    }

    clearDragList() {
        if (this._dragList.length) {
            this._dragList.forEach(drag => {
                if (drag && drag.node) {
                    drag.node.destroy();
                }
            })
            this._dragList = [];
        }
    }
}

