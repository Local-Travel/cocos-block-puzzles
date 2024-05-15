import { _decorator, Collider, Component, ITriggerEvent, Node, isValid, Vec3, tween } from 'cc';
import { Hex } from './Hex';
import { Constant } from '../util/Constant';
import { HexDrag } from './HexDrag';
import { Utils } from '../util/Utils';
const { ccclass, property } = _decorator;

@ccclass('HexGrid')
export class HexGrid extends Component {
    /** 类型 **/
    public type: number = 0;
    /** 格子中的hex最大数量 **/
    public maxHexCount: number = 0;
    /** 相邻格子颜色相同的标记 **/
    public isMark: boolean = false;

    public numNode: Node = null;

    /** 格子中的hex **/
    private _hexList: Hex[] = [];

    protected onEnable(): void {
        // const collider = this.getComponent(Collider)
        // if (collider) {
        //     collider.on('onTriggerEnter', this.onTriggerEnter, this)
        //     collider.on('onTriggerExit', this.onTriggerExit, this)
        // }
    }

    protected onDisable(): void {
        // const collider = this.getComponent(Collider)
        // if (collider) {
        //     collider.off('onTriggerEnter', this.onTriggerEnter, this)
        //     collider.off('onTriggerExit', this.onTriggerExit, this)
        // }
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    onDestroy() {

    }

    setType(type: number = Constant.GRID_ACTIVE_CODE_TYPE) {
        if (type === Constant.GRID_SKIN_PROPS.VEDIO || type === Constant.GRID_SKIN_PROPS.LOCK) {
            this.type = type
        } else {
            this.type = Constant.GRID_ACTIVE_CODE_TYPE
        }
    }

    setMaxHexCount(maxHexCount: number) {
        this.maxHexCount = maxHexCount;
    }

    setNumNode(numNode: Node) {
        this.numNode = numNode;
    }

    // 获取位置
    getPosition() {
        return this.node.position
    }

    setPosition(pos: Vec3) {
        this.node.position = pos
    }

    isActive() {
        return this.type === Constant.GRID_ACTIVE_CODE_TYPE;
    }

    setIsMark(isMark: boolean) {
        this.isMark = isMark;
    }

    setHexList(hexList: Hex[]) {
        this._hexList = hexList;
    }

    getHexList() {
        return this._hexList;
    }

    addHexList(list: Hex[]) {
        const vList = this.getValidHexList(list);
        this._hexList.push(...vList);
        this.showNum();
    }

    getValidHexList(list: Hex[]) {
        return list.filter(hex => hex && hex.node);
    }

    checkAndDelInvalid() {
        const len = this._hexList.length;
        const newList = this.getValidHexList(this._hexList);
        if (newList.length === len) return false;
        // 说明有坏数据
        this.setHexList(newList);
        return len - newList.length;
    }

    // delayCheckInvalidNode(delay: number) {
    //     tween(this.node).delay(delay).call(() => {
    //         if (this.checkAndDelInvalid()) {
    //             this.showNum();
    //         }
    //     });
    // }

    // 获取顶部类型相同的Hex
    getTopAllSame() {
        if (!this._hexList.length) return [];
        let len = this._hexList.length;
        let top = this._hexList[len - 1];
        let k = 1;
        for(let i = len - 2; i >= 0; i--) {
            const hex = this._hexList[i]
            if (hex && top && top.hexType && hex.hexType === top.hexType) {
                k++
            } else {
                break
            }
        }
        return this._hexList.slice(-k).reverse();
    }

    getTopAllSameLength() {
        return this.getTopAllSame().length
    }

    isEmpty() {
        return this._hexList.length == 0;
    }

    // 是否达到最大数量
    isFull() {
        return this._hexList.length >= this.maxHexCount
    }

    // 获取顶部Hex
    getTopHex() {
        const len = this._hexList.length;
        if (len === 0) {
            return null;
        }
        let top = this._hexList[len - 1];
        return top;
    }

    // 获取顶部Hex的类型
    getTopHexType(): string {
        const hex = this.getTopHex();
        if (hex) {
            return hex.hexType;
        }
        return '';
    }

    // 移除顶部的hex
    clearTopHexList(len: number) {
        this.setHexList(this._hexList.slice(0, -len));
        // this.resetHexPos();
        this.showNum();
    }

    resetHexPos() {
        if (!this._hexList || this._hexList.length === 0) return;
        this._hexList.reduce((pre, cur, i) => {
            if (i === 0) {
                const pos = this.node.position.clone();
                pos.y += Constant.HEX_SIZE_Y_H;
                cur.node.setPosition(pos);
                pre = cur;
            } else if (cur && cur.node) {
                const pos = cur.node.position.clone();
                const preY = pre.node.position.y;
                pos.y = preY + Constant.HEX_SIZE_Y_H;
                cur.node.setPosition(pos);
                pre = cur;
            }
            return pre;
        }, this._hexList[0]);
    }

    hideNum() {
        if (this.numNode) {
            this.numNode.active = false;
        }
    }

    showNum() {
        const num = this.getTopAllSameLength();
        if (num < 1 || num > 20) {
            this.numNode.active = false;
            return;
        }
        this.showMaterial(num);
    }


    showMaterial(type: number) {
        if (!this.numNode) return;

        const mPath = Utils.getNumMaterialPath(type);
        Utils.setMaterial(this.numNode, mPath);
        const pos = this.numNode.position.clone();
        pos.y = (this._hexList.length + 2) * Constant.HEX_SIZE_Y_H;
        this.numNode.setPosition(pos);
        this.numNode.active = true;
    }

    onTriggerEnter(event: ITriggerEvent) {
        const collisionNode = event.otherCollider.node;
        console.log('event.otherCollider enter', event.otherCollider);
        if (collisionNode.name.startsWith(Constant.CollisionType.DRAG_NAME)) {
            console.log('碰撞到网格');
            const hexDragNode = event.otherCollider.node;
            const hexDrag = hexDragNode.getComponent(HexDrag);
            if (this.isEmpty()) {
                console.log('空格子 drag上的list', hexDrag.getHexList());
                Constant.hexGridManager.setGridSkin(1, this);
            }
        } else {
            console.log('碰撞到其他');
        }
    }

    onTriggerExit(event: ITriggerEvent) {
        const collisionGroup = event.otherCollider.getGroup();
        console.log('event.otherCollider exit', event.otherCollider);
        Constant.hexGridManager.setGridSkin(0, this);
    }
}

