import { _decorator, sys, Vec3 } from "cc";
import { GoBoard } from "../GoBoard";

enum EVENT_TYPE {
  /** 减少拖拽的方块数量 */ 
  SUB_DRAG_BLOCK = 'SUB_DRAG_BLOCK',
}

export class Constants {
  // class
  static goBoard: GoBoard = null; 
  
  // game

  // event
  static EVENT_TYPE = EVENT_TYPE; // 事件类型


  // block
  static BLOCK_SIZE = 64; // 大小


}