import { _decorator, Component, Label, Node, ProgressBar } from 'cc';
import { Constant } from '../util/Constant';
import { User } from '../data/User';
const { ccclass, property } = _decorator;

@ccclass('PageHex')
export class PageHex extends Component {
    // 顶部
    @property(Node)
    scoreLabel: Node = null;
    @property(Node)
    userLabel: Node = null;
    @property(Node)
    progressRoot: Node = null;

    // 底部
    @property(Node)
    btnBombRoot: Node = null
    @property(Node)
    btnHammerRoot: Node = null

    // 技能数量
    @property(Node)
    btnBombLabel: Node = null
    @property(Node)
    btnHammerLabel: Node = null

    private _score: number = 0;
    private _totalScore: number = 0;
    private _userLevel: number = 1;

    protected onEnable(): void {
        this.btnBombRoot.on(Node.EventType.TOUCH_END, this.onClickBomb, this)
        this.btnHammerRoot.on(Node.EventType.TOUCH_END, this.onClickHammer, this)
    }

    protected onDisable(): void {
        this.btnBombRoot.off(Node.EventType.TOUCH_END, this.onClickBomb, this)
        this.btnHammerRoot.off(Node.EventType.TOUCH_END, this.onClickHammer, this)
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    init(totalScore: number, userLevel: number) {
        // 设置页面数据
        this._score = 0;
        this._totalScore = totalScore;
        this._userLevel = userLevel;
        this.showScoreLabel();
        this.showUserLabel();
        this.showBombLabel();
        this.showHammerLabel();
        this.updateProgress(this._score, this._totalScore);
    }

    showScoreLabel() {
        if (!this._totalScore) {
            this.scoreLabel.active = false;
        } else {
            this.scoreLabel.active = true;
        }
        this.scoreLabel.getComponent(Label).string = `${this._score}/${this._totalScore}`;
    }

    showUserLabel() {
        const str = `Lv.${this._userLevel}`;
        this.userLabel.getComponent(Label).string = str;
    }

    showBombLabel() {
        const bombCount = User.instance().getGameProps(Constant.PROPS_NAME.BOMB) || 0;
        this.btnBombLabel.getComponent(Label).string = bombCount.toString();
    }

    showHammerLabel() {
        const hammerCount = User.instance().getGameProps(Constant.PROPS_NAME.HAMMER) || 0;
        this.btnHammerLabel.getComponent(Label).string = hammerCount.toString();
    }

    addScore(score: number) {
        this._score += score;
        this.showScoreLabel();
        this.updateProgress(this._score, this._totalScore);
    }

    /** 点击爆炸技能 */
    onClickBomb() {
        this.useSkill(Constant.PROPS_NAME.BOMB)
    }

    /** 点击锤子技能 */
    onClickHammer() {
        this.useSkill(Constant.PROPS_NAME.HAMMER)
    }

    useSkill(skillName: string) {
        const count = User.instance().getGameProps(skillName)
        if (count <= 0) {
            // TODO: 弹框
            Constant.dialogManager.showTipLabel('道具不足，分享可免费获得该技能')
            return
        }
        Constant.hexGameManager.useGameSkill(skillName)
    }

    updateProgress(value: number, total: number) {
        const p = total > 0 ? value / total : 0
        this.progressRoot.getComponent(ProgressBar).progress = p
    }
}

