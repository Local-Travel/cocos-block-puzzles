import { _decorator, CCInteger, Component, Node } from 'cc';
import { User } from './data/User';
import { PageHex } from './page/PageHex';
import { Constant } from './util/Constant';
import { HexData } from './data/HexData';
import { HexDragControl } from './hex/HexDragControl';
import { HexGridManager } from './hex/HexGridManager';
import { Utils } from './util/Utils';
const { ccclass, property } = _decorator;

@ccclass('HexGameManager')
export class HexGameManager extends Component {
    @property(PageHex)
    pageHex: PageHex = null;

    @property(HexDragControl)
    hexDragControl: HexDragControl = null;

    @property(HexGridManager)
    hexGridManager: HexGridManager = null;

    @property({ type: CCInteger })
    userLevelTest: number = 0;


    public levelData: any = null;
    public gameStatus: number = Constant.GAME_STATE.GAME_READ;

    private _userLevel: number = 1;
    private _curScore: number = 0;

    protected __preload(): void {
        Constant.hexGameManager = this;
    }

    protected onEnable(): void {
        console.log('HexGameManager onEnable');
        Utils.setLocalStorage('scene', 'HexGameManager');
    }
    
    start() {
        this.init(); 
    }

    update(deltaTime: number) {
        
    }

    init() {
        const user = User.instance();
        const userLevel = this.userLevelTest || user.getLevel();
        const { col, list, data } = HexData.getLevelData(userLevel);
        this.levelData = data;
        console.log('userLevel', userLevel)
        this._userLevel = userLevel;
        this._curScore = 0;
        this.gameStatus = Constant.GAME_STATE.GAME_READ;

        this.pageHex.init(data.score, userLevel);
        // 设置数据
        Constant.hexManager.init();

        this.hexGridManager.init(list, col, data.skinCount, data.createSkinCount);

        // 设置拖拽
        this.hexDragControl.init(data.skinCount, data.createSkinCount);

        this.gameStatus = Constant.GAME_STATE.GAME_PLAYING;
    }

    updateScore(count: number) {
        if (count < 1) return;
        const newScore = Constant.HEX_REMOVE_ONE_SCORE * count;
        this._curScore += newScore;

        this.pageHex.addScore(newScore);
        console.log('updateScore', this._curScore);
        if (this._curScore >= this.levelData.score) {
            this.gameStatus = Constant.GAME_STATE.GAME_OVER;
            // 结束
            User.instance().setLevel(this._userLevel + 1);
            Constant.dialogManager.showSuccessModal();
        }
    }

    gameOver() {
        this.gameStatus = Constant.GAME_STATE.GAME_OVER;
        // 结束
        Constant.dialogManager.showFailModal();
    }


    useGameSkill(skillName: string) {
        this.hexDragControl.useGameSkill(skillName);
    }

}

