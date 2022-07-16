import { def, hasOwn, isObject, isValidArrayIndex } from '../../utils/index.js'
import { arrayMethods } from './array.js'
import Dep from './dep.js'

// Object.defineProperty可以侦测到对象的变化
// 每当从get的key中读取数据时，get函数便会被触发；每当往data的key中设置数据时，set函数触发
export function defineReactive(data, key, val) {
    // if (typeof val === 'object') {
    //     new Observer(val)  val是对象时，递归侦测
    // }
    let childOb = observer(val) // childOb是val的Observer的实例
    let dep = new Dep() // 依赖
    Object.defineProperty(data, key, {
        enumerable: true, // 可枚举
        configurable: true, //  表示可通过delete删除从而重新定义属性
        get: function () {
            dep.depend() // 收集依赖
            // 这里收集Array的依赖  obj.list=[1,2] 也会触发getter,Array在getter中收集依赖，在拦截器中触发依赖
            if (childOb) {
                // val是对象或者数组，会返回一个Observer的实例，这时收集它对应的依赖
                childOb.dep.depend()
            }
            return val
        },
        set: function (newVal) {
            if (newVal === val) {
                return
            }
            val = newVal
            // 触发依赖 为何在 val = newVal 下面，当getter时，收集到旧值，当触发set后，也是通过getter获取新值
            dep.notify()
        }
    })
}

/**
 * 为value创建一个Observer实例，如果已经创建，则直接返回Observer实例，避免重复侦测
 */
export function observer(value, asRootData) {
    if (!isObject(value)) {
        return
    }
    let ob
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        // 代表value有Observer实例
        ob = value.__ob__
    } else {
        ob = new Observer(value)
    }
    return ob
}

// __proto__是否可用
const hasProto = '__proto__' in {}
// 获取arrayMethods的key,包括不可枚举的
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)


// 递归侦测 所有key
export class Observer {
    constructor(value) {
        this.value = value
        this.dep = new Dep(); // 新增Dep,只有在这里，数组的getter和拦截器才都能访问到，getter可以访问Observer实例，拦截器也可以
        def(this.value, '__ob__', this) // 将Observer实例，赋值到value.__ob__ 就能在拦截器上拿到value.__ob__.dep依赖，标记是响应式数据
        if (Array.isArray(value)) {
            const augment = hasProto ? protoAugment : copyAugment
            // value.__proto__ = arrayMethods 因为有的浏览器不支持__proto__
            augment(value, arrayMethods, arrayKeys)
            this.observeArray(value) //侦测数组的每一项

        } else {
            this.walk(value)
        }
    }

    /**
     * walk会将每一个属性都转换成getter/setter的形式来侦测变化
     * 这个方法只有在数据类型时Object时被调用
     * */
    walk(obj) {
        const keys = Object.keys(obj)
        for (let i = 0; i < keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]])
        }
    }
    //侦测数组的每一项
    observeArray(list) {
        for (let i = 0; i < list.length; i++) {
            observer(list[i]);
        }
    }

}

function protoAugment(target, src, arrayKeys) {
    target.__proto__ = src
}
function copyAugment(target, src, keys) {
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        def(target, key, src[key])
    }
}

/**
 * vm.$set(target,key,value)
*/
export function set(target, key, val) {
    // 处理数组的情况
    if (Array.isArray(target) && isValidArrayIndex(key)) {
        // 设置数组的length
        target.length = Math.max(target.length, key)
        // 替换位置，因为调用了splice，拦截器会触发更新依赖，并处理成响应式
        target.splice(key, 1, val)
        return val
    }

    // key已经存在target中,key已经是响应式，直接修改，触发setter,向依赖发送通知
    if (key in target && !(key in Object.prototype)) {
        target[key] = val
        return val
    }

    // 处理新增的key
    const ob = target.__ob__
    if (target._isVue || (ob && ob.vmCount)) {
        process.env.NODE_ENV !== 'production' && console.warn('target不能是VUE.js实例或者VUE.js实例的根数据对象')
    }
    // 对象不是响应式，直接赋值并返回
    if (!ob) {
        target[key] = val
        return val
    }
    // 设置成响应式，并触发依赖，返回值
    defineReactive(target, key, val)
    ob.dep.notify()
    return val
}

/**
 * vm.$delete(target,key)
*/
export function del(target, key) {
    // 处理数组的情况
    if (Array.isArray(target) && isValidArrayIndex(key)) {
        // 替换位置，因为调用了splice，拦截器会触发更新依赖，并处理成响应式
        target.splice(key, 1)
        return val
    }
    const ob = target.__ob__
    if (target._isVue || (ob && ob.vmCount)) {
        process.env.NODE_ENV !== 'production' && console.warn('target不能是VUE.js实例或者VUE.js实例的根数据对象')
    }
    // key不是这个对象上的
    if (!hasOwn(target, key)) {
        return
    }
    delete target[key]
    // 对象不是响应式，直接返回
    if (!ob) {
        return
    }
    ob.dep.notify()
}