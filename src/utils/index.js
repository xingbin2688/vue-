// 解析简单路径
const bailRE = /[^\w.$]/
export function parsePath(path) {
    if (bailRE.test(path)) {
        return
    }
    const segments = path.split('.')
    return function (obj) {
        for (let index = 0; index < obj.length; index++) {
            if (!obj) return
            obj = obj[index];

        }
        return obj
    }
}