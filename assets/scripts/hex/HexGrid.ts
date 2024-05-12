import { _decorator, Collider, Component, ITriggerEvent, Node, Vec3 } from 'cc';
import { Hex } from './Hex';
import { Constant } from '../util/Constant';
import { HexDrag } from './HexDrag';
const { ccclass, property } = _decorator;

@ccclass('HexGrid')
export class HexGrid extends Component {
    // 类型
    public type: number = 0;
    // 格子中的hex
    public hexList: Hex[] = [];
    // 格子中的hex最大数量
    public maxHexCount: number = 0;

    protected onEnable(): void {
        const collider = this.getComponent(Collider)
        // if (collider) {
        //     collider.on('onTriggerEnter', this.onTriggerEnter, this)
        //     collider.on('onTriggerExit', this.onTriggerExit, this)
        // }
    }

    protected onDisable(): void {
        const collider = this.getComponent(Collider)
        // if (collider) {
        //     collider.off('onTriggerEnter', this.onTriggerEnter, this)
        //     collider.off('onTriggerExit', this.onTriggerExit, this)
        // }
    }

    start() {

    }

    update(deltaTime: number) {
        
    }

    setType(type: number) {
        this.type = type;
    }

    setMaxHexCount(maxHexCount: number) {
        this.maxHexCount = maxHexCount;
    }

    // 获取位置
    getPosition() {
        return this.node.position
    }

    setPosition(pos: Vec3) {
        this.node.position = pos
    }

    isActive() {
        return this.type === 0;
    }

    setHexList(hexList: Hex[]) {
        this.hexList = hexList;
    }

    addHexList(list: Hex[]) {
        this.hexList.push(...list);
    }

    // 获取顶部类型相同的Hex
    getTopAllSame() {
        let len = this.hexList.length, k = 1
        if (!len) return []
        const top = this.hexList[len - 1]
        for(let i = len - 2; i >= 0; i--) {
            const hex = this.hexList[i]
            if (hex && top && hex.hexType === top.hexType) {
                k++
            } else {
                break
            }
        }
        return this.hexList.slice(-k)
    }

    isEmpty() {
        return this.hexList.length == 0;
    }

    // 是否达到最大数量
    isFull() {
        return this.hexList.length >= this.maxHexCount
    }

    // 获取顶部Hex
    getTopHex() {
        const len = this.hexList.length;
        if (len == 0) {
            return null;
        }
        return this.hexList[len - 1];
    }

    // 移除顶部的hex
    clearTopHexList(len: number) {
        this.setHexList(this.hexList.slice(0, -len));
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

