import { _decorator, Component, Node, Graphics, macro, Vec3, math, CCInteger, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GobangBoard')
export class GobangBoard extends Component {
    @property(Node)
    boardNode: Node = null!; // 棋盘节点
    @property(CCInteger)
    lineCount: number = 10; // 棋盘格子行列数

    blockPosList: number[][] = [] // 每个点的位置

    private _g: Graphics = null; // 绘制组件
    private _gridSize: number = 0; // 棋盘格子大小

    start() {
        this._g = this.boardNode.getComponent(Graphics);
        const uiTransform = this.boardNode.getComponent(UITransform);
        this._gridSize = uiTransform.width / this.lineCount;
        this.drawChessBoard();
    }

    drawChessBoard() {
        // 绘制棋盘线条
        this._g.strokeColor = math.Color.BLACK;
        this._g.lineCap = Graphics.LineCap.ROUND;
        this._g.lineJoin = Graphics.LineJoin.ROUND;

        const startX = -this._gridSize * this.lineCount / 2; // 棋盘起始坐标 X
        const startY = -this._gridSize * this.lineCount / 2; // 棋盘起始坐标 Y

        // 绘制横线
        for (let i = 0; i <= this.lineCount; i++) {
            const y = startY + i * this._gridSize;
            const x = startX + this.lineCount * this._gridSize;
            this._g.moveTo(startX, y);
            this._g.lineTo(x, y);
            this._g.stroke();
        }

        // 绘制竖线
        for (let j = 0; j <= this.lineCount; j++) {
            const x = startX + j * this._gridSize;
            const y = startY + this.lineCount * this._gridSize;
            this._g.moveTo(x, startY);
            this._g.lineTo(x, y);
            this._g.stroke();

            for(let i = 0; i < this.lineCount && j < this.lineCount; i++) {
                const px = x + this._gridSize / 2;
                const yy = startY + i * this._gridSize;
                const py = yy + this._gridSize / 2;
                const pos = [px, py, 0];
                this.blockPosList.push(pos);
            }
        }
    }
}


