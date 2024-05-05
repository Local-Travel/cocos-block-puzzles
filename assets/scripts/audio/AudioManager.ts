import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
import { Constants } from '../util/Constant';
const { ccclass, property } = _decorator;

interface IAudioMap {
    [name: string]: AudioClip
 }

 @ccclass('AudioManager')
 export class AudioManager extends Component {
    @property(Node)
    public audioBgmNode: Node = null

    @property(Node)
    public audioNode: Node = null

    @property([AudioClip])
    public audioList: AudioClip[] = []
    
 
    private _audioDict: IAudioMap = {}
    private _audioSource: AudioSource = null
    private _audioBgmSource: AudioSource = null
    // 禁用所有声音
    private _isDisabled = false

    __preload () {
        Constants.audioManager = this
    }
 
    start () {
        for (let index = 0; index < this.audioList.length; index++) {
            const element = this.audioList[index];
            this._audioDict[element.name] = element
        }
        this._audioSource = this.audioNode.getComponent(AudioSource)
        this._audioBgmSource = this.audioBgmNode.getComponent(AudioSource)
        this._isDisabled = false
    }

    public onSound() {
        this._isDisabled = false
    }

    public offSound() {
        this._isDisabled = true
    }

    public playBgm() {
        if (this._isDisabled) return
        this._audioBgmSource.play()
    }

    public stopBgm() {
        this._audioBgmSource.stop()
    }
 
    public play(name: string) {
        if (this._isDisabled) return
        const audio = this._audioDict[name]
        if (audio) {
            this._audioSource.playOneShot(audio)
        }
    }
 }