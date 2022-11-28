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

// 初始化事件 是指将父组件在模板中使用的v-on注册的事件添加到子组件的事件系统
export function initEvents(vm) {
    vm._events = Object.create(null)
    // 初始化父组件附加的事件
    const listeners = vm.$options._parentListeners
    if (listeners) {
        updateComponentListeners(vm, listeners)
    }
}

let target


// add remove 添加和移除事件
function add(event, fn, once) {
    if (once) {
        target.$once(event, fn)
    } else {
        target.$on(event, fn)
    }
}

function remove(event, fn) {
    target.$off(event, fn)
}

export function updateComponentListeners(vm, listeners, oldListeners) {
    target = vm
    // 对比listeners oldListeners的不同，并调用add,remove进行事件的操作
    updateComponentListeners(listeners, oldListeners || {}, add, remove, vm)
}

export function updateComponentListeners(on, oldOn, add, remove, vm) {
    let name, cur, old, event
    for (name in on) {
        cur = on[name]
        old = oldOn[name]
        // 解析修饰符的 例如 v-on:increment.once  {~increment:function(){}}
        event = normalizeEvent(name)
        if (isUndef(cur)) {
            process.env.NODE_ENV !== 'production' && console.warn(
                `Invalid handler for event "${event.name}":got` + String(cur),
                vm
            )
        } else if (isUndef(old)) {
            if (isUndef(cur.fns)) {
                cur = on[name] = createFnInvokere(cur)
            }
            add(event.name, cur, event.once, event.capture, event.passive)
        } else if (cur !== old) {
            old.fns = cur
            on[name] = old
        }
    }
    for (name in oldOn) {
        if (isUndef(on[name])) {
            event = normalizeEvent(name)
            remove(event.name, oldOn[name], event.capture)
        }
    }
}

function normalizeEvent (name) {
    const passive = name.charAt(0) === '&'
    name = passive ? name.slice(1) : name
    const once = name.charAt(0) === '~'
    name = once ?  name.slice(1) : name
    const capture = name.charAt(0) === '!'
    name = capture ?  name.slice(1) : name
    return {
        name,
        once,
        capture,
        passive
    }
}