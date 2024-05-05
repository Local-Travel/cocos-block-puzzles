import { _decorator, Component, Node, Size, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Block')
export class Block extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

    setScale(scale: number) {
        this.node.setScale(scale, scale);
    }
}

