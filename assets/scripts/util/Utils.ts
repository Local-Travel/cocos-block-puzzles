import { Vec3, _decorator } from 'cc';

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
}

