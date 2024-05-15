import { _decorator, Enum, sys, Vec3 } from "cc";
import { BlockManager } from "../block/BlockManager";
import { AudioManager } from "../audio/AudioManager";
import { GameManager } from "../GameManager";
import { HexManager } from "../hex/HexManager";
import { DialogManager } from "../dialog/DialogManager";
import { HexGameManager } from "../HexGameManager";
import { HexGridManager } from "../hex/HexGridManager";

enum EVENT_TYPE {
  /** 减少拖拽的方块数量 */ 
  SUB_DRAG_BLOCK = 'SUB_DRAG_BLOCK',
}

/** 公共路径前缀 */
const COMMON_PATH_PREFIX = 'texture/common/'

/** 数字材质路径前缀 */
const HEX_TEXTURE_PATH_PREFIX = 'material/num/'

// 六边形皮肤管理
const HEX_SKIN_TYPE = {
  Style1: {// 类型1
     prefix: 'material/hex/style1/',
     skin: 'hex-skin-',
     skinNum: 7,
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
  /** 解锁 */
  VEDIO = -5,
   /** 视频 */
  LOCK = -6,
}

/** 碰撞类型 */
enum CollisionType {
  /** 格子组件 */
  GRID_NAME = 'grid',
  /** 拖动组件 */
  DRAG_NAME = 'hexDragNode',
  /** 格子组件 */
  GRID_TYPE = 2,
  /** 拖动组件 */
  DRAG_TYPE = 3,
}


/**游戏状态 */
enum GAME_STATE {
  /** 游戏就绪中 */
  GAME_READ = 0,
  /** 游戏进行中 */
  GAME_PLAYING = 1,
  /** 游戏暂停 */
  GAME_PAUSE = 2,
  /** 游戏结束 */
  GAME_OVER = 3,
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
  static hexGridManager: HexGridManager;
  static audioManager: AudioManager;
  static dialogManager: DialogManager;
  static hexGameManager: HexGameManager;
  
  
  // game
  static GAME_STATE = GAME_STATE; // 游戏状态

  // event
  static EVENT_TYPE = EVENT_TYPE; // 事件类型

  // path
  static COMMON_PATH_PREFIX = COMMON_PATH_PREFIX; // pic公共路径
  static HEX_TEXTURE_PATH_PREFIX = HEX_TEXTURE_PATH_PREFIX; // 数字材质路径前缀

  // block
  static BLOCK_SIZE = 64; // 大小
  static BLOCK_REMOVE_ONE_SCORE = 10; // 消除分数

  // hex 3d模型
  static HEX_SIZE = 4; // 大小
  static HEX_SIZE_Y_H = 2.5 / 10; // 大小
  static HEX_SKIN_TYPE = HEX_SKIN_TYPE; // 皮肤类型
  static HEX_REMOVE_ONE_SCORE = 1; // 消除分数
  static HEX_NODE_NAME = 'hex'; // hex节点名字
  

  // hex-grid 3d模型
  // static HEX_GRID_START_POINT = new Vec3(-8, 0, 8 * 1.5); // 网格起始点
  static HEX_GRID_START_POINT_Z = 8; // 网格起始点Z，x需要根据列数动态计算
  static GRID_SKIN_TYPE = GRID_SKIN_TYPE; // 皮肤类型
  static GRID_SKIN_PROPS = GRID_SKIN_PROPS; // 皮肤属性
  static GRID_ACTIVE_CODE_TYPE = 0; // 激活状态类型code

  // hex-drag
  static HEX_DRAG_START_POINT = new Vec3(-5, 0.25, 15); // 网格起始点
  static CollisionType = CollisionType; // 碰撞类型

  // props
  static PROPS_TYPE = PROPS_TYPE;// 道具类型
  static PROPS_NAME = PROPS_NAME;// 道具名称


}