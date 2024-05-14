import { Color, Graphics, Vec2, Vec3, _decorator, math, sys, log, resources, Material, MeshRenderer, Node } from 'cc';
import { WECHAT, BYTEDANCE, BAIDU } from "cc/env"
import { Constant } from './Constant';

export class Utils {
    /** 根据行列转换位置 */
    static convertRowColToPos(row: number, col: number, size: number, startX: number, startY: number): Vec3 {
        const x = startX + col * size + size / 2;
        const y = startY + row * size + size / 2;
        return new Vec3(x, y, 0);
    }

    /** 根据位置转换行列 */
    static convertPosToRowCol(pos: Vec3, size: number, startX: number, startY: number): number[] {
        const row = Math.round((pos.y - startY - size / 2) / size);
        const col = Math.round((pos.x - startX - size / 2) / size);
        return [row, col]
    }

    /** 根据行列转换位置-六边形，左上角起始点 */
    static convertRowColToPosHexagon(row: number, col: number, size: number, startX: number, startY: number): Vec3 {
        const radius = size / 2;
        const h = 1 / 2 * radius * Math.sqrt(3);
        const x = startX + radius + col * 1.5 * radius;
        const y = startY + (h + col % 2 * h + row * 2 * h);
        return new Vec3(x, 0, y);
    }

    /** 根据位置转换行列-六边形，左上角起始点 */
    static convertPosToRowColHexagon(pos: Vec3, size: number, startX: number, startY: number): number[] {
        const radius = size / 2;
        const h = 1 / 2 * radius * Math.sqrt(3);
        const x = pos.x;
        const y = pos.z;
        const col = Math.round((x - startX - radius) / (1.5 * radius));
        const row = Math.round((y - startY - col % 2 * h - h) / ( 2 * h));
        return [row, col];
    }

    /** 3d模型，计算左上角的起始点 */
    static getLeftBottomPoint(row: number, col: number) {
      const size = Constant.HEX_SIZE;
      const r = size / 2;
      const startX = - (col - 1) * r;

      const z = Constant.HEX_GRID_START_POINT_Z;
      const h = 2 * r * Math.sqrt(3);
      const startZ = z - h * (row - 1);

      return new Vec3(startX, 0, startZ);
    }

    /** hex在3d数组中的高度 */
    static getListHexYH(index: number) {
        return Constant.HEX_SIZE_Y_H * index;
    }

    /** 设置材质 */
    static setMaterial(meshNode: Node, path: string) {
      if (meshNode) {
        resources.load(path, Material, (err, material) => {
          // console.log(err, material);
          meshNode.getComponent(MeshRenderer).material = material;
        });
      }
    }

    static getNumMaterialPath(num: number) {
      return Constant.NUM_PATH_PREFIX + num;
    }

    /** 画一个实体六边形 */
    static drawFullHexagonReverse(g: Graphics, pos: Vec3, radius: number, lineWidth: number, fillColor: Color) {
        g.lineWidth = lineWidth;
        g.fillColor = fillColor;
        g.strokeColor = new Color(0, 0, 0, 150);
        const begin = new Vec2(pos.x, pos.y);
        const w = 1 / 2 * radius * Math.sqrt(3);        
        
        // 左上
        g.moveTo(begin.x - w, begin.y + 1 / 2 * radius);
        // 上
        g.lineTo(begin.x, begin.y + radius);
        // 右上
        g.lineTo(begin.x + w, begin.y + 1 / 2 * radius);
        // 右下
        g.lineTo(begin.x + w, begin.y - 1 / 2 * radius);
        // 下
        g.lineTo(begin.x, begin.y - radius);
        // 左下
        g.lineTo(begin.x - w, begin.y - 1 / 2 * radius);

        g.stroke();
        g.fill();
    }

    /** 画一个实体倒六边形 */
    static drawFullHexagon(g: Graphics, pos: Vec3, radius: number, lineWidth: number, fillColor: Color) {
        g.lineWidth = lineWidth;
        g.fillColor = fillColor;
        g.strokeColor = new Color(0, 0, 0, 150);
        const begin = new Vec2(pos.x, pos.y);
        const h = 1 / 2 * radius * Math.sqrt(3);        
        
        // 左上
        g.moveTo(begin.x - 1 / 2 * radius, begin.y + h);
        // 右上
        g.lineTo(begin.x + 1 / 2 * radius, begin.y + h);
        // 右
        g.lineTo(begin.x + radius, begin.y);
        // 右下
        g.lineTo(begin.x + 1 / 2 * radius, begin.y - h);
        // 左下
        g.lineTo(begin.x - 1 / 2 * radius, begin.y - h);
        // 左
        g.lineTo(begin.x - radius, begin.y);

        g.stroke();
        g.fill();
    }

    /**
      * 设置本地数据
      * @param key 
      * @param data 
      */
    static setLocalStorage(key: string, data: any) {
        try {
            sys.localStorage.setItem(key, JSON.stringify(data))
            return true
        } catch (e) {
            console.error(e)
        }
        return false
    }

    /**
     * 获取本地数据
     * @param key 
     */
    static getLocalStorage(key: string) {
        try {
            const dataStr = sys.localStorage.getItem(key)
            if (dataStr) {
                const data = JSON.parse(dataStr)
                return data
            }
        } catch (e) {
            console.error(e)
        }
        return null
    }

 /**
 * 调用振动效果
 */
  static vibrateShort() {
    if (WECHAT && typeof (<any>window).wx !== undefined) {// 微信
      (<any>window).wx.vibrateShort({
        type: 'heavy',
        success: () => log('调用振动成功'),
        fail: (err) => log('调用振动失败', err),
      });
    }
    if (BYTEDANCE && typeof (<any>window).tt !== undefined) {// 字节
      (<any>window).tt.vibrateShort({
        success: () => log('调用振动成功'),
        fail: (err) => log('调用振动失败', err),
      });
    }
    if (BAIDU && typeof (<any>window).swan !== undefined) {// 百度
      (<any>window).swan.vibrateShort({
        success: () => log('调用振动成功'),
        fail: (err) => log('调用振动失败', err),
      });
    }
  }

  /**
   * 被动分享
   */
  static passiveShare() {
    if (WECHAT && typeof (<any>window).wx !== undefined) {// 微信
      // 显示当前页面的转发按钮
      (<any>window).wx.showShareMenu({
        withShareTicket: false,
        menus: ['shareAppMessage', 'shareTimeline'],
        success: (res) => {
            console.log('开启被动转发成功！');
        },
        fail: (res) => {
            console.log(res);
            console.log('开启被动转发失败！');
        }
      });
      
      // 监听用户点击右上角分享按钮
      (<any>window).wx.onShareAppMessage((res) => {
          console.log('用户点击右上角分享按钮', res);
          return {
            // title: '',
            query: 'shareMsg='+'share user2'  // query最大长度(length)为2048
          }
      })
      // 监听用户点击右上角分享按钮
      (<any>window).wx.onShareTimeline((res) => {
          console.log('用户点击右上角分享按钮', res);
          return {
            // title: '', 
            query: 'shareMsg='+'share user3'  // query最大长度(length)为2048
          }
      })
    }
  }
  
  /**
   * 调用主动分享
   */
  static activeShare(shareStr: string = 'share user1') {
    // 主动分享按钮
    if (WECHAT && typeof (<any>window).wx !== undefined) {// 微信
      (<any>window).wx.shareAppMessage({
        // imageUrl: '',
        query: 'shareMsg=' + shareStr  // query最大长度(length)为2048
      });
    }
  }

  
  /**
   * 获取微信分享数据
   * 当其他玩家从分享卡片上点击进入时，获取query参数
   * @returns 
   */
  static getWXQuery() {
    if (WECHAT && typeof (<any>window).wx !== undefined) {// 微信
      let object = (<any>window).wx.getLaunchOptionsSync();
      let shareMsg = object.query['shareMsg'];
      console.log(shareMsg);
      return shareMsg;
    }
  }
}

