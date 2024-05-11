import { _decorator, CCInteger, Component, director, EventTouch, instantiate, Node, Prefab, Rect, Size, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { BlockData } from '../data/BlockData';
import { Constant } from '../util/Constant';
import { BlockDrag } from './BlockDrag';
const { ccclass, property } = _decorator;

@ccclass('BlockDragControl')
export class BlockDragControl extends Component {
    @property(Prefab)
    dragNodePrefab: Prefab = null!;
    @property(Prefab)
    blockPrefab: Prefab = null!;
    @property(Node)
    target: Node = null!;

    @property({ type: CCInteger })
    blockCount: number = 3;

    private _blockNum: number = 0;
    private _targetRect: Rect = null;
    private _rPos: Vec3 = null;
    private _startPos: Vec3 = null;

    private _dragBlockList: BlockDrag[] = [];

    private _dragReuslt: boolean | [Vec3, number[]] = false;

    protected onLoad(): void {
        this._blockNum = this.blockCount;
        if (this.target) {
            this._targetRect = this.target.getComponent(UITransform).getBoundingBox();
        }
    }

    start() {
        this.generateBlocks();
    }

    update(deltaTime: number) {
        
    }

    substractCount(drag: BlockDrag) {
        this._blockNum--;
        if (this._blockNum <= 0) {
            this._blockNum = this.blockCount;
            this._dragBlockList = [];
            this.generateBlocks();
        } else {
            const list = this._dragBlockList.filter(item => item !== drag);
            this._dragBlockList = list;
            console.log('this._dragBlockList', this._dragBlockList);
        }
    }

    generateBlocks() {
        const size = Constant.blockManager.gridSize;
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
                        const blockNode = instantiate(this.blockPrefab);
                        blockNode.getComponent(UITransform).setContentSize(blockSize); 
                        
                        const y = yStart + (len - i) * size;
                        const x = xStart + j * size;
                        const pos = v3(x, y, 0);
    
                        blockNode.setPosition(pos);
                        blockNode.setParent(dragNode);

                        posList.push(pos);
                        blockList.push(blockNode);
                    }
                }
            }
            dragNode.getComponent(UITransform).setContentSize(new Size(xLen * size, len * size));
            const blockDrag = dragNode.getComponent(BlockDrag);
            blockDrag.setBlockList(blockList);
            blockDrag.setBlockPosList(posList);
            blockDrag.setStyleList(styleList);
            blockDrag.setScale(0.5, 0.5);

            this._dragBlockList.push(blockDrag);
        }
    }

    handleTouchStart(event: EventTouch, drag: BlockDrag) {
        this._startPos = drag.getPosition();
    }

    handleTouchMove(event: EventTouch, drag: BlockDrag) {
        if (!this._targetRect) return;
        const touchPos = event.getLocation();
        const nPos = drag.getNodeSpacePosition(touchPos);

        const rPos = drag.getRelativePosition(new Vec2(nPos.x, nPos.y));
        const { x, y, width, height } = this._targetRect;
        const size = Constant.blockManager.gridSize;

        if (rPos.x < x + size / 2 
            || rPos.x > x + width - size / 2 
            || rPos.y > y + height - size / 2
            || nPos.y < 0) {
            console.log('超出范围');
            return;
        }

        drag.setPosition(nPos);

        // console.log('targetRect', this._targetRect, rPos, nPos);
        if (this._targetRect.contains(v2(rPos.x, rPos.y))) {
            drag.setScale(1, 1);
            this._dragReuslt = Constant.blockManager.checkDragPosition(drag.getBlockPosList(), v3(rPos.x, rPos.y));
            this._rPos = v3(rPos.x, rPos.y, 0);
        } else {
            drag.setScale(0.5, 0.5);
            this._dragReuslt = false;
            this._rPos = null;
            Constant.blockManager.removeRectColor();
        }
    }

    handleTouchEnd(event: EventTouch, drag: BlockDrag) {
        if (this._dragReuslt) {
            const offset = this._dragReuslt[0];
            const rowColList = this._dragReuslt[1];
            const newPos = new Vec3(this._rPos.x + offset.x, this._rPos.y + offset.y, 0);
            drag.setPosition(newPos);

            Constant.blockManager.setFillPositionByIndex(rowColList, drag.getBlockList());
            Constant.blockManager.checkBoardFull(rowColList);
            Constant.blockManager.removeRectColor();

            drag.setParent(this.target);
            drag.setDragAbled(false);
            // 减少拖拽的方块数量
            this.substractCount(drag);

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

        this.checkResult();
    }

    checkResult() {
        if (!this.checkEmptyDragBlock()) {// 结束
            console.log('结束');
            Constant.dialogManager.showTipLabel('已没有可放的位置');
        }
    }

    checkEmptyDragBlock() {
        let flag = false;
        for(let i = 0; i < this._dragBlockList.length; i++) {
            const blockDrag = this._dragBlockList[i];
            const styleList = blockDrag.getStyleList();
            if (Constant.blockManager.checkBoardEmptyModelSize(styleList)) {
                flag = true;
                break;
            }
        }
        return flag;
    }
}

