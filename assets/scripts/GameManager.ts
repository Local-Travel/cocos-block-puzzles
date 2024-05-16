import { _decorator, CCInteger, Component, Node } from 'cc';
import { Constant } from './util/Constant';
import { User } from './data/User';
import { BlockData } from './data/BlockData';
import { PageBlock } from './page/PageBlock';
import { Utils } from './util/Utils';
import { BlockDragControl } from './block/BlockDragControl';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(PageBlock)
    pageBlock: PageBlock = null!;

    @property(BlockDragControl)
    blockDragControl: BlockDragControl = null!;

    @property({ type: CCInteger })
    userLevelTest: number = 0;

    public levelData: any = null;
    public gameStatus: number = Constant.GAME_STATE.GAME_READ;

    private _userLevel: number = 1;
    private _curScore: number = 0;

    protected __preload(): void {
        Constant.gameManager = this;
    }

    protected onEnable(): void {
        console.log('GameManager onEnable');
        Utils.setLocalStorage('scene', 'GameManager');
    }
    
    start() {
        this.init();
    }

    update(deltaTime: number) {
        
    }

    init() {
        const user = User.instance();
        const userLevel = this.userLevelTest || user.getLevel();
        const { col, list, data } = BlockData.getLevelData(userLevel);
        this.levelData = data;
        console.log('userLevel', userLevel)
        this._userLevel = userLevel;
        this._curScore = 0;
        this.gameStatus = Constant.GAME_STATE.GAME_READ;

        this.pageBlock.init(data.score, userLevel);
        // 设置方块数据
        Constant.blockManager.init(list);
        this.blockDragControl.init();

        this.gameStatus = Constant.GAME_STATE.GAME_PLAYING;
    }

    updateScore(count: number) {
        if (count < 1) return;
        const newScore = Constant.BLOCK_REMOVE_ONE_SCORE * count;
        this._curScore += newScore;

        this.pageBlock.addScore(newScore);
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
        this.blockDragControl.useGameSkill(skillName);
    }
}

