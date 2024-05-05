import { _decorator, Component, Node, randomRangeInt } from 'cc';

export class BlockData {
    static getData(level: number) {

    }

    /** 获取形状 */
    static getBlockStyle() {
        const a0 = [
            [1, 0], 
            [1, 0],
            [1, 1],
        ];
        const a1 = [
            [0, 1], 
            [1, 0]
        ];
        const a2 = [
            [0, 1, 1], 
            [1, 1, 0]
        ];
        const a3 = [
            [0, 1], 
            [1, 1],
            [1, 0]
        ];
        const a4 = [[1, 1, 1]]
        const a5 = [
            [1],
            [1],
            [1],
        ]
        const a6 = [
            [1, 1, 1],
            [0, 1, 0]
        ]
    
        const a = [a0, a1, a2, a3, a4, a5, a6];
    
        const i = randomRangeInt(0, a.length);
        return a[i]
    }
}
