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

    private _userLevel: number = 1;

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

        this.pageHex.init();
        // 设置数据
        Constant.hexManager.init();

        this.hexGridManager.init(list, col, data.skinCount);

        // 设置拖拽
        this.hexDragControl.init(data.skinCount);
    }
}

