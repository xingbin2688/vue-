import Dep from './dep'

// Object.defineProperty可以侦测到对象的变化
// 每当从get的key中读取数据时，get函数便会被触发；每当往data的key中设置数据时，set函数触发
function defineReactive(data, key, val) {
    if (typeof val === 'object') {
        new Observer(val)
    }
    let dep = new Dep // 依赖
    Object.defineProperty(data, key, {
        enumerable: true, // 可枚举
        configurable: true, //  表示可通过delete删除从而重新定义属性
        get: function () {
            dep.depend() // 收集依赖
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

// 递归侦测 所有key
export class Observer {
    constructor(value) {
        this.value = value
        if (!Array.isArray(value)) {
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
}