export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        //做点什么
        const vm = this
        // 在vue实例上创建_events属性，用来存储事件 为何要用Object.create而不是{} 创建一个纯粹的对象，以防止原型污染。
        vm._events = Object.create(null)

        // 这里存储整个实例上的watch
        vm._watchers = []
    }
}