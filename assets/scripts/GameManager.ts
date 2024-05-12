import { _decorator, CCInteger, Component, Node } from 'cc';
import { Constant } from './util/Constant';
import { User } from './data/User';
import { BlockData } from './data/BlockData';
import { PageBlock } from './page/PageBlock';
import { Utils } from './util/Utils';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property(PageBlock)
    pageBlock: PageBlock = null!;

    @property({ type: CCInteger })
    userLevelTest: number = 0;

    public levelData: any = null;

    private _userLevel: number = 1;

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

        this.pageBlock.init();
        // 设置方块数据
        Constant.blockManager.init(list);
    }
}

