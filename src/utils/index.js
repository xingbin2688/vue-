// 解析简单路径
const bailRE = /[^\w.$]/
export function parsePath(path) {
    if (bailRE.test(path)) {
        return
    }
    const segments = path.split('.')
    return function (obj) {
        for (let index = 0; index < segments.length; index++) {
            if (!obj) return
            obj = obj[segments[index]];

        }
        return obj
    }
}

// 给一个对象定义一个不可枚举的key:val
export function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true

    })
}

export function isObject(val) {
    return typeof val === 'object'
}

// 判断对象是否有key这个值
export function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key)
}

// 判断是不是数组的有效值
export function isValidArrayIndex(val) {
    const n = parseFloat(String(val))
    return n >= 0 && Math.floor(n) === n && isFinite(val)
}

export function toArray(list, start) {
    start = start || 0;
    var i = list.length - start;
    var ret = new Array(i);
    while (i--) {
        ret[i] = list[i + start];
    }
    return ret
}