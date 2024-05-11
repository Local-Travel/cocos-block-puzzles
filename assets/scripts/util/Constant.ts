import { _decorator, sys, Vec3 } from "cc";
import { BlockManager } from "../block/BlockManager";
import { AudioManager } from "../audio/AudioManager";
import { GameManager } from "../GameManager";

enum EVENT_TYPE {
  /** 减少拖拽的方块数量 */ 
  SUB_DRAG_BLOCK = 'SUB_DRAG_BLOCK',
}

/** 
 * 道具名称
 */
enum PROPS_NAME {
  /** 炸弹球 */
  BOMB = 'bomb',
}

/** 道具类型 */
const PROPS_TYPE = {
  /** 炸弹球 */
  bomb: {
    name: PROPS_NAME.BOMB,
    desc: '炸弹泡泡可以消除方圆内的泡泡',
    value: 1,
  },
}

export class Constant {
  // class
  static gameManager: GameManager;
  static blockManager: BlockManager;
  static audioManager: AudioManager;
  
  // game

  // event
  static EVENT_TYPE = EVENT_TYPE; // 事件类型


  // block
  static BLOCK_SIZE = 64; // 大小

  // props
  static PROPS_TYPE = PROPS_TYPE;// 道具类型
  static PROPS_NAME = PROPS_NAME;// 道具名称


}