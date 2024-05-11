import { _decorator, Component, Node } from 'cc';
import { Constant } from '../util/Constant';
const { ccclass, property } = _decorator;

@ccclass('PageHex')
export class PageHex extends Component {
    start() {
        this.init();
    }

    update(deltaTime: number) {
        
    }

    init() {
        // 设置方块数据
        Constant.gameManager.init();
    }
}

