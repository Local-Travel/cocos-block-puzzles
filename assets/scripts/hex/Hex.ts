import { _decorator, Component, tween, v3, Vec3 } from 'cc';
import { Constant } from '../util/Constant';
const { ccclass, property } = _decorator;

@ccclass('Hex')
export class Hex extends Component {

    // 类型
    public hexType: string = '0';

    start() {

    }

    update(deltaTime: number) {
        
    }

    setPosition(pos: Vec3) {
        this.node.setPosition(pos);
    }

    getPosition() {
        return this.node.position;
    }

    setParent(parent: any) {
        this.node.setParent(parent);
    }

    setHexType(hexType: string) {
        this.hexType = hexType;
    }

    eraseNode() {
        tween(this.node).to(0.3, { scale: v3(0, 0, 0) }).call(() => {            
            this.node.destroy();
        }).start();
    }
}

