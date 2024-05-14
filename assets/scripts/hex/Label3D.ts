import { _decorator, Component, Label, MeshRenderer, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Label3D')
export class Label3D extends Component {
    @property(Label)
    label: Label = null!;
    
    start() {

    }

    update(deltaTime: number) {
        
    }

    setLabelText(text: string) {
        this.label.string = text;
        this.label.node.active = true;
        this.label.updateRenderData(true);
        this.label.node.active = false;
        // 包含弃用
        let mat = this.node.getComponent(MeshRenderer)!.getMaterial(0)!;
        mat.setProperty('mainTexture', this.label.spriteFrame!.getGFXTexture());
    }
}

