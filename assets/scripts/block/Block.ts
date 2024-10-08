import { _decorator, Component, Node, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Block')
export class Block extends Component {

    // 类型
    public blockType: number = 0;

    start() {

    }

    update(deltaTime: number) {
        
    }

    setDataProp(blockType: number = 0) {
        this.blockType = blockType;
    }

    removeNodeAction() {
        if (this.blockType) {
            return
        }
        
        tween(this.node).to(0.3, { scale: v3(0, 0, 0) }).call(() => {            
            this.node.destroy();
        }).start();
    }
}

