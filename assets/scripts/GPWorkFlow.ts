import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export class GPWorkFlowNode {
    public OnStart:Function;
    public OnUpdate:Function;
    public OnEnd:Function;
    public nextNodes:GPWorkFlowNode[] = new Array<GPWorkFlowNode>();
    public get nextNode():GPWorkFlowNode {
        return this.nextNodes.length > 0 ? this.nextNodes[0] : null;
    }
    public set nextNode(_nextNode:GPWorkFlowNode) {
        if (this.nextNodes.length == 0) {
            this.nextNodes.push(_nextNode);
        } else {
            this.nextNodes[0] = _nextNode;
        }
    }
    private _nextIdx = -1;
    public get nextIdx() {
        return this._nextIdx;
    }
    public done(nexIdx = 0) {
        this._nextIdx = nexIdx;
        if (this.OnEnd)
            this.OnEnd(this);
    }
    public isDone() {
        return this._nextIdx >= 0;
    }
    public refresh() {
        this._nextIdx = -1;
        for (let i = 0; i < this.nextNodes.length; i++) {
            this.nextNodes[i].refresh();
        }
    }
    public start() {
        if (this.OnStart)
            this.OnStart(this);
    }
    public update(deltaTime) {
        if (this.OnUpdate)
            this.OnUpdate(this, deltaTime);
    }
    public hasNext() {
        return this.nextNodes.length > 0;
    }
}
export class GPWorkFlow {
    public headNode:GPWorkFlowNode;
    private curNode:GPWorkFlowNode;
    start() {
        if (this.headNode) {
            this.headNode.refresh();
        }
        this.curNode = this.headNode;
        this.curNode.start();
    }

    update(deltaTime: number) {
        if (this.curNode != null) {
            this.curNode.update(deltaTime)
            if (this.curNode.isDone()) {
                if (this.curNode.hasNext()) {
                    this.curNode = this.curNode.nextNodes[this.curNode.nextIdx];
                    this.curNode.start()
                } else {
                    this.curNode = null
                }
            }
        }
    }
    insertHeadNode(wfNode:GPWorkFlowNode) {
        let tmp = this.headNode;
        this.headNode = wfNode;
        wfNode.nextNode = tmp;
    }
}
