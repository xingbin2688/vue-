import { toArray } from "../../utils/index.js"
// Vue 事件相关的实例方法  vm.$on vm.$off vm.$once vm.$emit
export function eventsMixin(Vue) {
    Vue.prototype.$on = function (event, fn) {
        // 用法 vm.$on(event,callback) 监听当前实例上的自定义事件，事件可以由vm.$emit触发。回调函数会接收所有传入事件所触发的函数的额外函数
        /**
         * vm.$on ('test',function(mes) {xxx})
         * vm.$emit('test','hi')
         * */
        const vm = this
        if (Array.isArray(event)) {
            for (let i = 0; i < event.length; i++) {
                this.$on(event[i], fn)
            }
        } else {
            // vm._events是一个对象，从哪来的？ 在new Vue()的时候，执行this._init(options)时，创建的
            (vm._events[event] || (vm._events[event] = [])).push(fn)
        }
        return vm
    }
    Vue.prototype.$once = function (event, fn) {
        // 监听一个自定义事件，但是只触发一次，在第一次触发之后移除监听器
        const vm = this
        function on() {
            this.$off(event, fn)
            fn.apply(vm, arguments)
        }
        on.fn = fn
        // 注册事件，在触发事件的时候，执行on函数，解绑事件，
        vm.$on(event, on)
        return vm
    }
    Vue.prototype.$off = function (event, fn) {
        /**
         * 用法：如果没有提供参数，全部移除监听器
         * 如果只提供了事件，则移除该事件的所有的监听器
         * 如果提供了事件和回调，则只移除这个回调的监听器
        */
        const vm = this
        if (!arguments.length) {
            // 直接初始化
            vm._events = Object.create(null)
            return vm
        }

        if (Array.isArray(event)) {
            for (let i = 0; i < event.length; i++) {
                this.$off(event[i], fn)
            }
            return vm
        }

        // 如果事件名称错了
        const cbs = vm._events[event]
        if (!cbs) {
            return vm
        }
        // 如果只有事件
        if (arguments.length == 1) {
            vm._events[event] = null
            return vm
        }
        // 事件和回调
        if (fn) {
            const cbs = vm._events[event]
            let cb
            let i = cbs.length
            // 从后向前循环，这样在移除列表的监听器时，不会影响到未便利到的监听器
            // 这里为什么还cb.fn === fn 是为了vm.$once实现
            while (i--) {
                cb = cbs[i]
                if (cb === fn || cb.fn === fn) {
                    cbs.splice(i, 1)
                    break
                }
            }
        }

        return vm
    }
    Vue.prototype.$emit = function (event) {
        // vm.$emit(event,[...args])
        const vm = this
        let cbs = vm._events[event]
        if (cbs) {
            const args = toArray(arguments, 1)
            for (let i = 0; l = cbs.length, i < l; i++) {
                try {
                    cbs[i].apply(vm, args)
                } catch (error) {
                    // xxx
                }
            }
        }
        return vm
    }
}