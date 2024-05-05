import { _decorator, Component, Node } from 'cc';
import { Utils } from '../util/Utils';
import { Constants } from '../util/Constant';
const { ccclass, property } = _decorator;

@ccclass('User')
export class User {
    /** 等级 */
    private level: number = 1
    /** 金币 */
    private gold: number = 0
    /** 历史最高分 */
    private histScore: number = 0
    /** 游戏道具 */
    private gameProps: any = {}
    /** 游戏道具名称 */
    private ballSkin: string = ''

    /** 每个道具初始数量 */
    private propsNum: number = 2

    private static _instance: User = null

    public static instance() {
        if (!this._instance) {
            const user = Utils.getLocalStorage('abnormalUser')
            if (user) {
                this._instance = new User(user.level, user.gold, user.gameProps, user.ballSkin, user.histScore)
            } else {
                this._instance = new User()
            }
        }
        return this._instance
    }

    constructor(level: number = 1, gold: number = 100, gameProps: any = null, ballSkin: string = '', histScore: number = 0) {
        this.level = level
        this.gold = gold
        this.histScore = histScore
        this.ballSkin = ballSkin || 'Style1'
        /** 游戏道具使用对象存储 */
        if (!gameProps) {
            let obj = {}
            for(let key in Constants.PROPS_NAME) {
                obj[Constants.PROPS_NAME[key]] = this.propsNum
            }
            this.gameProps = obj
        } else {
            this.gameProps = gameProps
        }
    }

    public getLevel() {
        return this.level
    }

    public setLevel(level: number) {
        let newLevel = level
        this.level = newLevel >= 1 ? newLevel : 1
        Utils.setLocalStorage('abnormalUser', this)
    }

    public getGold() {
        return this.gold
    }

    public setGold(gold: number) {
        this.gold = gold >= 0 ? gold : 0
        Utils.setLocalStorage('abnormalUser', this)
    }

    public getHistScore() {
        return this.histScore
    }

    public setHistScore(histScore: number) {
        this.histScore = histScore >= this.histScore ? histScore : this.histScore
        Utils.setLocalStorage('abnormalUser', this)
    }

    public getBallSkin() {
        return this.ballSkin
    }

    public setBallSkin(ballSkin: string) {
        this.ballSkin = ballSkin
        Utils.setLocalStorage('abnormalUser', this)
    }

    /** 获取游戏道具 */
    public getGameProps(key: string) {
        return this.gameProps[key]
    }

    /** 设置游戏道具 */
    public setGameProps(key: string, num: number) {
        const name = Constants.PROPS_NAME[key]
        if (name) {
            this.gameProps[name] = num > 0 ? num : 0
            Utils.setLocalStorage('abnormalUser', this)
        }
    }
}


