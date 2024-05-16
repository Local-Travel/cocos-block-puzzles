import { _decorator, Component, Node } from 'cc';
import { Utils } from '../util/Utils';
import { Constant } from '../util/Constant';
const { ccclass, property } = _decorator;

@ccclass('HexFail')
export class HexFail extends Component {
    @property(Node)
    btnShare: Node = null

    @property(Node)
    btnGiveUp: Node = null

    start() {

    }

    protected onEnable(): void {
        this.btnShare.on(Node.EventType.TOUCH_END, this.onShare, this)
        this.btnGiveUp.on(Node.EventType.TOUCH_END, this.onGiveUp, this)
    }

    protected onDisable(): void {
        this.btnShare.off(Node.EventType.TOUCH_END, this.onShare, this)
        this.btnGiveUp.off(Node.EventType.TOUCH_END, this.onGiveUp, this)
    }

    update(deltaTime: number) {
        
    }

    onGiveUp() {
        this.hideModal()
    }

    onShare() {
        // 调用分享接口
        Utils.activeShare('hexFailModal')
        // TODO: 激励
        
        this.hideModal()
    }

    showModal() {
        this.node.active = true
    }

    hideModal() {
        Constant.hexGameManager.init()
        this.node.active = false
    }
}

