import { _decorator, Component, Label, Node } from 'cc';
import { Constant } from '../util/Constant';
const { ccclass, property } = _decorator;

@ccclass('PageHex')
export class PageHex extends Component {
    @property(Node)
    scoreLabel: Node = null;

    private _score: number = 0;

    start() {

    }

    update(deltaTime: number) {
        
    }

    init() {
        // 设置页面数据
        this._score = 0;
        this.showScoreLabel();
    }

    showScoreLabel() {
        this.scoreLabel.getComponent(Label).string = this._score.toString();
    }

    addScore(score: number) {
        this._score += score;
        this.showScoreLabel();
    }
}

