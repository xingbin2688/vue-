import { initLifecycle } from './lifecycle'
import { initEvents } from './events'
export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        //做点什么
        const vm = this
        // 在vue实例上创建_events属性，用来存储事件 为何要用Object.create而不是{} 创建一个纯粹的对象，以防止原型污染。
        // vm._events = Object.create(null)

        // 这里存储整个实例上的watch
        // vm._watchers = []
        vm.$options = mergeOptions(
            resolveConstructorOptions(vm.constructor),
            options || {},
            vm
        )

        initLifecycle(vm)
        initEvents(vm)
        initRender(vm)
        callHook(vm, 'beforeCreate')
        initInjections(vm) // 在data/props前初始化inject
        initState(vm)
        initProvide(vm) // 在data/props后初始化provide
        callHook(vm, 'created')

        if (vm.$options.el) {
            vm.$mount(vm.$options.el)
        }
    }
}


function callHook(vm, hook) {
    // hook是数组，因为有混入
    const handlers = vm.$options[hook]
    if (handlers) {
        for (let i = 0; i < handlers.length; i++) {
            try {
                handlers[i].call(vm)
            } catch (error) {
                handleError(e, vm, `${hook} hook`)
            }

        }
    }
}