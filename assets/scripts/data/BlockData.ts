import { _decorator, Component, Node, randomRangeInt } from 'cc';

export class BlockData {
    /** 获取等级数据 */
    static getLevelData(level: number) {
        const levelList = [
            {
                level: 0,
                score: 600,
                skinCount: 2,
                targetCount: 0,
                targetIcon: 0,
                name: '关卡 1',
                desc: '',
                list: [
                    0, 0, 0, 0, 1, 1, 0, 0, 0, 0,
                    0, 0, 0, 0, 1, 1, 0, 0, 0, 0,
                    0, 0, 0, 0, 1, 1, 0, 0, 0, 0,
                    0, 0, 0, 0, 2, 2, 0, 0, 0, 0,
                    1, 1, 1, 2, 0, 0, 2, 1, 1, 1,
                    1, 1, 1, 2, 0, 0, 2, 1, 1, 1,
                    0, 0, 0, 0, 2, 2, 0, 0, 0, 0,
                    0, 0, 0, 0, 1, 1, 0, 0, 0, 0,
                    0, 0, 0, 0, 1, 1, 0, 0, 0, 0,
                    0, 0, 0, 0, 1, 1, 0, 0, 0, 0,
                ]
            },
        ]

        const col = 10
        let data = levelList[0]
        if (level <= levelList.length && level > 0) {
            data = levelList[level - 1]
            data.level = level
        }

        return {
            col,
            list: data.list,
            data,
        }
    }

    /** 获取形状 */
    static getBlockStyle() {
        const a0 = [
            [1, 0],
            [1, 0],
            [1, 1],
        ];
        const a0_1 = [
            [0, 1],
            [0, 1],
            [1, 1],
        ];
        const a0_2 = [
            [1, 1],
            [1, 1],
            [1, 1],
        ];
        
        const a2 = [
            [0, 1, 1],
            [1, 1, 0]
        ];
        const a2_1 = [
            [1, 1, 0],
            [0, 1, 1]
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
        const a6_1 = [
            [0, 1, 0],
            [1, 1, 1]
        ]
        const a7 = [
            [1, 1],
            [1, 1]
        ]
        const a7_1 = [
            [1, 0],
            [1, 1]
        ]
        const a7_2 = [
            [0, 1],
            [1, 1]
        ]
        const a7_3 = [
            [0, 1],
            [1, 0]
        ];
        const a8 = [
            [1],
            [1]
        ]
        const a8_1 = [
            [1, 1]
        ]

        const a = [a0, a0_1, a0_2, a2, a2_1, a3, a4, a5, a6, a6_1, a7,
            a7_1, a7_2, a7_3, a8, a8_1
        ];

        const i = randomRangeInt(0, a.length);
        return a[i]
    }
}
