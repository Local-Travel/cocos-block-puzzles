import { _decorator, CCInteger, Component, director, instantiate, Node, Prefab, Rect, Size, UITransform, v2, v3, Vec2, Vec3 } from 'cc';
import { GoBoard } from './GoBoard';
import { BlockData } from './data/BlockData';
import { Constants } from './util/Constant';
import { Drag } from './Drag';
const { ccclass, property } = _decorator;

@ccclass('DragControl')
export class DragControl extends Component {
    @property(Node)
    page: Node = null;
    @property(GoBoard)
    goBoard: GoBoard = null!;
    @property(Prefab)
    dragNodePrefab: Prefab = null!;
    @property(Prefab)
    blockPrefab: Prefab = null!;

    @property({ type: CCInteger })
    blockCount: number = 3;

    private _blockNum: number = 0;

    protected onLoad(): void {
        this._blockNum = this.blockCount;
        director.on(Constants.EVENT_TYPE.SUB_DRAG_BLOCK, this.substractCount, this)
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
        const size = this.goBoard.gridSize;
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
            dragNode.getComponent(Drag).setBlockList(blockList);
            dragNode.getComponent(Drag).setBlockPosList(posList);
            dragNode.setScale(0.5, 0.5);
        }
    }
}

