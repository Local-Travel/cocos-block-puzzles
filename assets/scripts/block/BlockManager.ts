import { _decorator, Component, Node, Graphics, macro, Vec3, math, CCInteger, UITransform, v3, Prefab, Intersection2D, Vec2, instantiate, Size, Color, EventTouch } from 'cc';
import { Constant } from '../util/Constant';
import { Utils } from '../util/Utils';
import { BlockDragControl } from './BlockDragControl';
import { BlockDrag } from './BlockDrag';
import { Block } from './Block';
const { ccclass, property } = _decorator;

@ccclass('BlockManager')
export class BlockManager extends Component {
    @property(Node)
    boardNode: Node = null; // 棋盘节点
    @property(Prefab)
    blockPrefab: Prefab = null;
    @property(BlockDragControl)
    blockDragControl: BlockDragControl = null;
    @property(CCInteger)
    lineCount: number = 10; // 棋盘格子行列数

    gridSize: number = 0; // 棋盘格子大小
    startX: number = 0; // 棋盘起始坐标 X
    startY: number = 0; // 棋盘起始坐标 Y

    private _g: Graphics = null; // 绘制组件
    private _gColor: Graphics = null; // 绘制颜色组件
    private _uiTransform: UITransform = null;
    private _blockPosList: any[] = [] // 每个点的位置

    protected __preload(): void {
        Constant.blockManager = this;
    }

    onLoad() {
        this._gColor = this.node.getChildByName('Color').getComponent(Graphics);
        this._g = this.boardNode.getComponent(Graphics);
        this._uiTransform = this.boardNode.getComponent(UITransform);
        this.gridSize = this._uiTransform.width / this.lineCount;

        this.drawChessBoard();
    }

    start() {
        
    }

    init(list: number[]) {         
        this.setBlockPosList(list);
    }

    /** 绘制格子 */
    drawChessBoard() {
        // 绘制线条
        // this._g.strokeColor = new Color().fromHEX('#69DBFF');
        this._g.lineCap = Graphics.LineCap.ROUND;
        this._g.lineJoin = Graphics.LineJoin.ROUND;

        this.startX = -this.gridSize * this.lineCount / 2; // 棋盘起始坐标 X
        this.startY = -this.gridSize * this.lineCount / 2; // 棋盘起始坐标 Y

        // 绘制横线
        for (let i = 0; i <= this.lineCount; i++) {
            const y = this.startY + i * this.gridSize;
            const x = this.startX + this.lineCount * this.gridSize;
            this._g.moveTo(this.startX, y);
            this._g.lineTo(x, y);
            this._g.stroke();
        }

        // 绘制竖线
        for (let j = 0; j <= this.lineCount; j++) {
            const x = this.startX + j * this.gridSize;
            const y = this.startY + this.lineCount * this.gridSize;
            this._g.moveTo(x, this.startY);
            this._g.lineTo(x, y);
            this._g.stroke();
        }

        for(let i = 0; i < this.lineCount; i++){
            for(let j = 0; j < this.lineCount; j++){
                // const x = this.startX + j * this.gridSize + this.gridSize / 2;
                // const y = this.startY + i * this.gridSize + this.gridSize / 2;
                const pos = Utils.convertRowColToPos(i, j, this.gridSize, this.startX, this.startY);
                this._blockPosList.push([pos, 0, null]);
            }
        }
        // console.log(this._blockPosList[0])
        // console.log(this._blockPosList[9])
        // console.log(this._blockPosList[90])
        // console.log(this._blockPosList[99])
        // const posArr = [this._blockPosList[0][0], this._blockPosList[9][0], this._blockPosList[90][0], this._blockPosList[99][0]]
        // this.drawRectColor(posArr);
        // this.removeRectColor();

        // const list = []
        // for(let i = 0; i < this._blockPosList.length; i++) {
        //     const pos = this._blockPosList[i][0];
        //     list.push(pos);
        // }
        // this.drawRectColor(list);
    }

    /** 设置格子内容 */
    setBlockPosList(list: number[]) {
        const size = new Size(this.gridSize, this.gridSize);
        for(let i = 0; i < this._blockPosList.length; i++) {
            const pos = this._blockPosList[i][0];
            if (list[i] > 0) {
                const blockNode = instantiate(this.blockPrefab);
                blockNode.getComponent(UITransform).setContentSize(size);
                blockNode.setPosition(pos);
                blockNode.parent = this.boardNode;

                this.setGridPosVal(i, 1, blockNode);
            }
        }
    }

    setGridPosVal(index: number, fill: number, bNode: Node) {
        if (!this._blockPosList.length || index < 0 || index >= this._blockPosList.length) {
            return;
        }
        this._blockPosList[index][1] = fill;
        this._blockPosList[index][2] = bNode;
    }

    getGridPosVal(index: number) {
        if (!this._blockPosList.length || index < 0 || index >= this._blockPosList.length) {
            return null;
        }
        return this._blockPosList[index].slice();
    }

    isEmptyPos(row: number, col: number, index: number = -1) {
        const k = index !== -1 ? index : this.getIndex(row, col);
        if (!this._blockPosList.length || k < 0 || k >= this._blockPosList.length) {
            return false;
        }
        const val = this.getGridPosVal(k);
        return val && val[1] === 0;
    }

    fillColor(pos: Vec3, color: math.Color) {
        const x = pos.x - this.gridSize / 2 + 3;
        const y = pos.y - this.gridSize / 2 + 3;
        this._gColor.fillColor = color;
        this._gColor.fillRect(x, y, this.gridSize - 6, this.gridSize - 6);
        this._gColor.fill();
    }

    fillColorList(posList: Vec3[], color: math.Color) {
        for (let i = 0; i < posList.length; i++) {
            this.fillColor(posList[i], color);
        }
    }

    drawRectColor(posList: Vec3[]) {
        this.fillColorList(posList, new Color().fromHEX('#2debff'));
    }

    removeRectColor() {
        this._gColor.clear();
    }

    getIndex(row: number, col: number) {
        return row * this.lineCount + col;
    }

    /** 检查拖拽方块是否可以塞入空板中 */
    checkDragPosition(posList: Vec3[], dragPos: Vec3): boolean | [Vec3, number[]]{
        this.removeRectColor();
        let offset = new Vec3(0, 0, 0);
        let newPos = new Vec3(0, 0, 0);
        const rowColList = [];
        const newBlockPosList = [];
        const d = dragPos.clone();
        // console.log('=====================')
        // console.log('posList', posList, dragPos)
        for (let i = 0; i < posList.length; i++) {
            const p = posList[i].clone();
            newPos = new Vec3(0, 0, 0);
            Vec2.add(newPos, p, d);
            // console.log('newPos', newPos, p);
            // Vec2.subtract(offset, p, newPos);

            const [row, col] = Utils.convertPosToRowCol(newPos, this.gridSize, this.startX, this.startY)
            const index = this.getIndex(row, col);
            const gridPos = this.getGridPosVal(index);
            // console.log('gridPos', gridPos);
            // console.log('row', row, col)
            if (row < 0 || row >= this.lineCount || col < 0 || col >= this.lineCount) {
                console.log('超出大盘范围')
                return false;
            }
            if (!gridPos) {
                console.log('不存在该位置')
                return false;
            }
            if (gridPos[1] === 1) {
                console.log('该位置已经有方块')
                return false;
            }
            const pos = gridPos[0].clone();
            newBlockPosList.push(pos);
            rowColList.push([row, col]);

            if (i === 0) {
                Vec2.subtract(offset, pos, newPos)
            }
        }
        // console.log(newBlockPosList);

        this.drawRectColor(newBlockPosList);
        // console.log('offset', offset)

        return [offset, rowColList];
    }

    /** 塞入空板中 */
    setFillPositionByIndex(rowColList: number[], blockList: Node[]) {
        for (let i = 0; i < rowColList.length; i++) {
            const index = this.getIndex(rowColList[i][0], rowColList[i][1]);
            this.setGridPosVal(index, 1, blockList[i]);
        }
    }

    /** 检查横向纵向是否满了，并销毁 */
    checkBoardFull(rowColList: number[]) {
        const rowList = [];
        const colList = [];

        // 横向检查
        for (let k = 0; k < rowColList.length; k++) {
            const row = rowColList[k][0];
            const indexList = [];
            let j = 0;
            for(j = 0; j < this.lineCount; j++) {
                const index = this.getIndex(row, j);
                const gridPos = this.getGridPosVal(index);
                if (!gridPos || gridPos[1] === 0) {
                    break
                }
                indexList.push(index)
            }
            if (j >= this.lineCount) {
                rowList.push(indexList);
            }
        }

        // 纵向检查
        for (let k = 0; k < rowColList.length; k++) {
            const col = rowColList[k][1];
            const indexList = [];
            let i = 0;
            for(i = 0; i < this.lineCount; i++) {
                const index = this.getIndex(i, col);
                const gridPos = this.getGridPosVal(index);
                if (!gridPos || gridPos[1] === 0) {
                    break
                }
                indexList.push(index)
            }
            if (i >= this.lineCount) {
                colList.push(indexList);
            }
        }

        // 销毁横向
        this.removeBlock(rowList);

        // 销毁纵向
        this.removeBlock(colList);

        this.removeInvalidDragNode();

        // effect
        if (rowList.length || colList.length) {
            Constant.audioManager.play('erase');
        }
    }

    /** 检查是否有空模块位置 */
    checkBoardEmptyModelSize(size: number[][]) {
        if (!size || size.length === 0) return true;

        const row = this.lineCount;
        const col = this.lineCount;
        const rowIndexList = [];
        let mIndex = 0;
        const srow = size.length;
        const scol = size.reduce(((pre, cur, i) => {
            if (cur && Array.isArray(cur)) {
                const validArr = cur.filter(k => k > 0);
                if (pre < validArr.length) {
                    mIndex = i;
                    return validArr.length;
                }
            }
            return pre;
        }), 0);
        // 横向检查, 检查出符合行数
        for (let i = 0; i < row; i++) {
            let k = 0;
            for(let j = 0; j < col; j++) {
                if (this.isEmptyPos(i, j)) {
                    k++;
                    if (k >= scol) {
                        rowIndexList.push([i, j - scol + 1]);
                        if (srow === 1) {
                            return true;
                        }
                    }
                } else {
                    k = 0;
                }
            }
        }

        if (rowIndexList.length === 0) return false;

        // console.log('rowIndexList', rowIndexList);
        for(let k = 0; k < rowIndexList.length; k++) {
            const item = rowIndexList[k];
            if (this.checkSizeIsValid(size, item[0], item[1], row, mIndex)) {
                console.log('valid pos', item);
                return true;
            }
        }

        return false;
        
    }

    checkSizeIsValid(size: number[][], gridRow: number, gridCol: number, row: number, mIndex: number) {
        const startRow = gridRow - mIndex;
        // console.log('startRow', startRow);
        if (startRow < 0) return false;
        for(let i = 0; i < size.length; i++) {
            for(let j = 0; j < size[i].length; j++) {
                const val = size[i][j];
                const r = i + startRow;
                const c = j + gridCol;
                if (r >= row) return false;
                if (!val) continue;
                if (this.isEmptyPos(r, c)) continue;
                return false;
            }
        }
        return true;
    }

    removeBlock(list: number[][]) {
        for(let i = 0; i < list.length; i++) {
            const indexList = list[i];
            for(let j = 0; j < indexList.length; j++) {
                const index = indexList[j];
                const gridPos = this.getGridPosVal(index);
                if (!gridPos) continue;
                const blockNode = gridPos[2];
                if (blockNode) {
                    blockNode.getComponent(Block).removeNodeAction()
                }
                this.setGridPosVal(index, 0, null);
            }
        }
    }

    removeInvalidDragNode() {
        // 清除无用的节点
        const children = this.boardNode.children
        for(let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.name === 'dragNode' && child.children.length === 0) {
                child.destroy();
            }
        }
    }

    handleTouchStart(event: EventTouch, drag: BlockDrag) {
        this.blockDragControl && this.blockDragControl.handleTouchStart(event, drag);
    }

    handleTouchMove(event: EventTouch, drag: BlockDrag) {
        this.blockDragControl && this.blockDragControl.handleTouchMove(event, drag);
    }

    handleTouchEnd(event: EventTouch, drag: BlockDrag) {
        this.blockDragControl && this.blockDragControl.handleTouchEnd(event, drag);
    }
}

