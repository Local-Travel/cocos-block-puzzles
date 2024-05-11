import { _decorator, CCInteger, Component, director, EventTouch, instantiate, Node, Prefab, Rect, Size, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { BlockData } from '../data/BlockData';
import { Constant } from '../util/Constant';
import { HexDrag } from './HexDrag';
const { ccclass, property } = _decorator;

@ccclass('HexDragControl')
export class HexDragControl extends Component {
    @property(Prefab)
    dragNodePrefab: Prefab = null!;
    @property(Prefab)
    hexPrefab: Prefab = null!;
    @property(Node)
    target: Node = null!;

    @property({ type: CCInteger })
    blockCount: number = 3;

    private _blockNum: number = 0;
    private _targetRect: Rect = null;
    private _rPos: Vec3 = null;
    private _startPos: Vec3 = null;

    private _dragReuslt: boolean | [Vec3, number[]] = false;

    protected onLoad(): void {
        this._blockNum = this.blockCount;
        if (this.target) {
            this._targetRect = this.target.getComponent(UITransform).getBoundingBox();
        }

        director.on(Constant.EVENT_TYPE.SUB_DRAG_BLOCK, this.substractCount, this)
    }

    start() {
        this.generateBlocks();
    }

    update(deltaTime: number) {
        
    }

    substractCount() {
        this._blockNum--;
        if (this._blockNum <= 0) {
            this._blockNum = this.blockCount;
            this.generateBlocks();
        }
    }

    generateBlocks() {
        const size = Constant.hexManager.gridSize;
        const blockSize = new Size(size, size);
        
        const startX = -200;
        for(let k = 0; k < this._blockNum; k++) {
            const dragNode = instantiate(this.dragNodePrefab);
            dragNode.setPosition(v3(startX + k * 200, 0, 0));
            dragNode.setParent(this.node);

            const styleList = BlockData.getBlockStyle();
            const posList = [];
            const blockList = [];

            // console.log(styleList);

            const len = styleList.length
            const xLen = len ? styleList[0].length : 0;
            const yStart = -len / 2 * size - size / 2;
            const xStart = -xLen / 2 * size + size / 2;
            for (let i = 0; i < len; i++) {
                for(let j = 0; j < xLen; j++) {
                    const block = styleList[i][j];
                    if (block) {
                        const hexNode = instantiate(this.hexPrefab);
                        hexNode.getComponent(UITransform).setContentSize(blockSize); 
                        
                        const y = yStart + (len - i) * size;
                        const x = xStart + j * size;
                        const pos = v3(x, y, 0);
    
                        hexNode.setPosition(pos);
                        hexNode.setParent(dragNode);

                        posList.push(pos);
                        blockList.push(hexNode);
                    }
                }
            }
            dragNode.getComponent(UITransform).setContentSize(new Size(xLen * size, len * size));
            const hexDrag = dragNode.getComponent(HexDrag);
            hexDrag.setBlockList(blockList);
            hexDrag.setBlockPosList(posList);
            hexDrag.setScale(0.5, 0.5);
        }
    }

    handleTouchStart(event: EventTouch, drag: HexDrag) {
        this._startPos = drag.getPosition();
    }

    handleTouchMove(event: EventTouch, drag: HexDrag) {
        if (!this._targetRect) return;
        const touchPos = event.getLocation();
        const nPos = drag.getNodeSpacePosition(touchPos);

        const rPos = drag.getRelativePosition(new Vec2(nPos.x, nPos.y));
        const { x, y, width, height } = this._targetRect;
        const size = Constant.hexManager.gridSize;

        if (rPos.x < x + size / 2 
            || rPos.x > x + width - size / 2 
            || rPos.y > y + height - size / 2
            || nPos.y < 0) {
            console.log('超出范围');
            return;
        }

        drag.setPosition(nPos);

        console.log('targetRect', this._targetRect, rPos, nPos);
        if (this._targetRect.contains(v2(rPos.x, rPos.y))) {
            drag.setScale(1, 1);
            this._dragReuslt = Constant.hexManager.checkDragPosition(drag.getBlockPosList(), v3(rPos.x, rPos.y));
            this._rPos = v3(rPos.x, rPos.y, 0);
        } else {
            drag.setScale(0.5, 0.5);
            this._dragReuslt = false;
            this._rPos = null;
            Constant.hexManager.removeRectColor();
        }
    }

    handleTouchEnd(event: EventTouch, drag: HexDrag) {
        if (this._dragReuslt) {
            const offset = this._dragReuslt[0];
            const rowColList = this._dragReuslt[1];
            const newPos = new Vec3(this._rPos.x + offset.x, this._rPos.y + offset.y, 0);
            drag.setPosition(newPos);

            Constant.hexManager.setFillPositionByIndex(rowColList, drag.getBlockList());
            Constant.hexManager.checkBoardFull(rowColList);
            Constant.hexManager.removeRectColor();

            drag.setParent(this.target);
            drag.setDragAbled(false);
            // 减少拖拽的方块数量
            director.emit(Constant.EVENT_TYPE.SUB_DRAG_BLOCK);

            // effect
            Constant.audioManager.play('water2');
        } else {
            console.log('恢复原来位置');
            // 恢复初始位置
            drag.resetOriginPosition();
            drag.setScale(0.5, 0.5);
            drag.setDragAbled(true);
            this._dragReuslt = false;
        }
    }
}

