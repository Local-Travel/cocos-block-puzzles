import { _decorator, Component, tween, v3 } from 'cc';
import { Constant } from '../util/Constant';
const { ccclass, property } = _decorator;

@ccclass('Hex')
export class Hex extends Component {

    // 类型
    public blockType: number = 0;

    start() {

    }

    update(deltaTime: number) {
        
    }

    setDataProp(blockType: number = 0) {
        this.blockType = blockType;
    }

    eraseNode() {
        if (this.blockType) {
            return
        }
        
        tween(this.node).to(0.3, { scale: v3(0, 0, 0) }).call(() => {            
            this.node.destroy();
        }).start();
    }
}

