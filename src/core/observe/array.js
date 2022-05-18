const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)
['push', 'pop', 'unshift', 'shift', 'splice', 'sort', 'reverse'].forEach(method => {
    const original = arrayMethods[method] // 缓存原始方法
    Object.defineProperty(arrayMethods, method, {
        value: function mutator(...args) {
            // this指向arrayMethods，arrayMethods是实例的原型，this相当于实例
            const ob = this.__ob__ // 获取Observer实例
            ob.dep.notify()
            return original.apply(this, args)
        },
        enumerable: false,
        writable: true, //表示能否修改属性的值。默认值为true。
        configurable: true
    })
})