import { _decorator, Component, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Block')
export class Block extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

    eraseNode() {
        tween(this.node).to(0.3, { scale: v3(0, 0, 0) }).call(() => {
            this.node.destroy();
        }).start();
    }
}

