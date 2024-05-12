import { Color, Graphics, Vec2, Vec3, _decorator, math, sys } from 'cc';
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
        const y = startY - (h + col % 2 * h + row * 2 * h);
        return new Vec3(x, 0, y);
    }

    /** 根据位置转换行列-六边形，左上角起始点 */
    static convertPosToRowColHexagon(pos: Vec3, size: number, startX: number, startY: number): number[] {
        const radius = size / 2;
        const h = 1 / 2 * radius * Math.sqrt(3);
        const x = pos.x;
        const y = pos.z;
        const col = Math.round((x - startX - radius) / (1.5 * radius));
        const row = Math.round((startY - y - col % 2 * h - h) / ( 2 * h));
        return [row, col];
    }

    /** hex在3d数组中的高度 */
    static getListHexYH(index: number) {
        return Constant.HEX_SIZE_Y_H * index;
    }

    /** 是否超出边界 */
    static checkOutOfBounds(pos: Vec3, box: math.Rect, s: number = 0) {
        const { x, y, width, height } = box;
        const { x: dx, y: dy } = pos;
        let xLeft = x + s;
        let xRight = x + width - s;
        let yTop = y + height - s;
        let yBottom = y + s;
        if (x === 0 && y === 0) {// 说明是左下角起始点的
            const sw = width / 2;
            const sh = height / 2;
            xLeft = -sw + s;
            xRight = sw - s;
            yTop = sh - s;
            yBottom = -sh + s;
        }
        // console.log(pos, parentBox);
        if (dx < xLeft || dx > xRight || dy < yBottom || dy > yTop) {
            console.log('超出边界');
            return true;
        }
        return false;
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
}

