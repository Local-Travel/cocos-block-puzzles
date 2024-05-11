import { _decorator, Component, Label, Node, resources, Size, Sprite, SpriteFrame, tween, UITransform, Vec3 } from 'cc';
import { Constant } from '../util/Constant';
// import { EndlessFail } from './EndlessFail';
import { Utils } from '../util/Utils';
const { ccclass, property } = _decorator;

@ccclass('DialogManager')
export class DialogManager extends Component {
    @property(Node)
    MsgTip: Node = null

    @property(Node)
    PicTip: Node = null

    // @property(EndlessFail)
    // endlessFail: EndlessFail = null

    __preload () {
        Constant.dialogManager = this
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    showFail() {
        // if (Utils.getLocalStorage('scene') == 'GameManager') {
        //     this.fail.showNode()
        // } else {
        //     this.endlessFail.showNode()
        // }
    }


    showTipLabel(tip: string, cb: Function = () => {}) {
        const label = this.MsgTip.getComponent(Label)
        label.string = tip
        
        tween(this.MsgTip)
        .to(0.01, { position: new Vec3(0, 0, 0), scale: new Vec3(1, 1, 1) }) 
        .call(() => {
            this.MsgTip.active = true
            this.hideTipLabel(cb)
        })
        .start()
    }
    
    hideTipLabel(cb: Function = () => {}) {
        tween(this.MsgTip)
        .delay(1)
        .to(0.5, { position: new Vec3(0, 30, 0), scale: new Vec3(0, 0, 0) }, { 
            easing: "fade",
        }) 
        .call(() => {
            this.MsgTip.active = false
            cb()
        })
        .start()
    }

    showTipPic(picName: string, size: number = 100, position: Vec3 = new Vec3(0, 0, 0), cb: Function = () => {}) {
        const uiTransform = this.PicTip.getComponent(UITransform)
        uiTransform.contentSize = new Size(size, size)
        
        const picPath = Constant.COMMON_PATH_PREFIX + picName + '/spriteFrame'
        resources.load(picPath, SpriteFrame, (err, spriteFrame) => {
            // console.log(err, spriteFrame)
            if (spriteFrame) {
                this.PicTip.getComponent(Sprite).spriteFrame = spriteFrame
                
                tween(this.PicTip)
                .to(0.01, { position }) 
                .call(() => {
                    this.PicTip.active = true
                    this.hidePicTip(position, cb)
                })
                .start()
            }
        })
    }

    hidePicTip(position: Vec3 = new Vec3(0, 0, 0), cb: Function = () => {}) {
        tween(this.PicTip)
        .delay(0.5)
        .to(0.5, { position }, { 
            easing: "fade",
        }) 
        .call(() => {
            this.PicTip.active = false
            cb()
        })
        .start()
    }

}

