import { _decorator, Component, Node, randomRangeInt } from 'cc';

interface LevelData {
    level?: number
    score: number
    skinCount: number
    createSkinCount: number
    targetCount: number
    targetIcon: number
    name: string
    desc?: string
    col: number
    /** 格子预设的数据，正数表示hex数量，负数表示格子类型（广告） */
    list: number[]
}

export class HexData {
    /** 获取等级数据 */
    static getLevelData(level: number) {
        const levelList: LevelData[] = [
            {
                level: 0,
                score: 600,
                skinCount: 3,
                createSkinCount: 2,
                targetCount: 0,
                targetIcon: 0,
                name: '关卡 1',
                desc: '',
                col: 5,
                list: [
                    0, 0, 0, 0, 0,
                    0, 0, 6, 3, 0,
                    0, 8, -1, 0, 0,
                    0, 0, 0, 0, 0,
                    0, 0, 0, 0, 0,
                ],
            },
        ]

        let data = levelList[0]
        if (level <= levelList.length && level > 0) {
            data = levelList[level - 1]
            data.level = level
        }

        return {
            col: data.col,
            list: data.list,
            data,
        }
    }
}
