import { _decorator, sys, Vec3 } from "cc";
import { BlockManager } from "../block/BlockManager";
import { AudioManager } from "../audio/AudioManager";
import { GameManager } from "../GameManager";
import { HexManager } from "../hex/HexManager";
import { DialogManager } from "../dialog/DialogManager";
import { HexGameManager } from "../HexGameManager";

enum EVENT_TYPE {
  /** 减少拖拽的方块数量 */ 
  SUB_DRAG_BLOCK = 'SUB_DRAG_BLOCK',
}

/** 公共路径前缀 */
const COMMON_PATH_PREFIX = 'texture/common/'

// 六边形皮肤管理
const HEX_SKIN_TYPE = {
  Style1: {// 类型1
     prefix: 'material/hex/style1/',
     skin: 'hex-skin-',
     skinNum: 3,
  },
}

// 格子形皮肤管理
const GRID_SKIN_TYPE = {
  Style1: {// 类型1
     prefix: 'material/grid/style1/',
     skin: 'grid-skin-',
     skinNum: 3,
  },
}

/** 
 * 格子皮肤属性
 */
enum GRID_SKIN_PROPS {
  /** 默认 */
  DEFAULT = 0,
  /** 激活 */
  ACTIVE = 1,
  /** 视频 */
  VEDIO = 2,
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
  static hexManager: HexManager;
  static audioManager: AudioManager;
  static dialogManager: DialogManager;
  static hexGameManager: HexGameManager;
  
  // game

  // event
  static EVENT_TYPE = EVENT_TYPE; // 事件类型

  // path
  static COMMON_PATH_PREFIX = COMMON_PATH_PREFIX; // pic公共路径


  // block
  static BLOCK_SIZE = 64; // 大小

  // hex
  static HEX_SIZE = 40; // 大小
  static HEX_SIZE_Y_H = 2.5; // 大小
  static HEX_SKIN_TYPE = HEX_SKIN_TYPE; // 皮肤类型

  // hex-grid
  static HEX_GRID_START_POINT = new Vec3(-100, 0, 30); // 网格起始点
  static GRID_SKIN_TYPE = GRID_SKIN_TYPE; // 皮肤类型
  static GRID_SKIN_PROPS = GRID_SKIN_PROPS; // 皮肤属性

  // hex-drag
  static HEX_DRAG_START_POINT = new Vec3(-60, 0, 150); // 网格起始点

  // props
  static PROPS_TYPE = PROPS_TYPE;// 道具类型
  static PROPS_NAME = PROPS_NAME;// 道具名称


}