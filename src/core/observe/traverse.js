import { isObject } from "../../utils/index.js"

const seenObjects = new Set()
export function traverse(val) {
    _traverse(val, seenObjects)
    seenObjects.clear()
}

function _traverse(val, seen) {
    let i, keys
    const isA = Array.isArray(val)
    // 不是数据或者对象或者被冻结就什么也不干
    if ((!isA && !isObject(val)) || Object.isFrozen(val)) {
        return
    }
    // 防止重复收集依赖，上面有seenObjects.clear()清空操作
    if (val.__ob__) {
        const depId = val.__ob__.dep.id
        if (seen.has(depId)) {
            return
        }
        seen.add(depId)
    }

    if (isA) {
        i = val.length
        while (i--) {
            _traverse(val[i], seen)
        }
    } else {
        keys = Object.keys(val)
        i = kes.length
        while (i--) {
            _traverse(val[keys[i]], seen)
        }
    }

}