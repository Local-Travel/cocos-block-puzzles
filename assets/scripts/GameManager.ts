import { _decorator, CCInteger, Component, Node } from 'cc';
import { Constant } from './util/Constant';
import { User } from './data/User';
import { BlockData } from './data/BlockData';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property({ type: CCInteger })
    userLevelTest: number = 0;

    public levelData: any = null;

    private _userLevel: number = 1;

    protected __preload(): void {
        Constant.gameManager = this;
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

        // 设置方块数据
        Constant.blockManager.setBlockData(list);
    }
}

