import { isNative } from './index'

// nextTick实现
const callbacks = []
let pengding = false
// 执行所有的回调，并清空列表
function flushCallbacks() {
    pengding = false
    const copies = callbacks.slice(0)
    callbacks.length = 0
    for (let i = 0; i < copies.length; i++) {
        copies[i]()
    }
}
let microTimerFunc


// 2.4版本之前 因为微任务优先级太高，在某些场景会出问题 ， 所以提供了在特殊场合下可以强制使用宏任务的方法
/**
 * 例如：点击事件的回调使用了withMacroTask进行包装，那么在点击事件被触发时，如果回调中修改了数据，那么这个修改数据所触发的更新 DOM的操作会被添加到宏任务队列中。当回调执行完毕后，将useMacroTask恢复为false 在执行fn.apply(null,arguments)时 执行nextTick 发现useMacroTask是true 便会执行异步
 */
let macroTimerFunc
let useMacroTask = false
// 将回调添加到宏任务中，macroTimerFunc
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
    macroTimerFunc = () => {
        setImmediate(flushCallbacks)
    }
} else if (typeof MessageChannel !== 'undefined' && (isNative(MessageChannel) || MessageChannel.toString() === '[object MessageChannelConstructor]')) {
    const channel = new MessageChannel()
    const port = channel.port2
    channel.port1.onmessage = flushCallbacks
    macroTimerFunc = () => {
        port.postMessage(1)
    }
} else {
    macroTimerFunc = () => {
        setTimeout(flushCallbacks, 0)
    }
}

// 当浏览器不支持promise时，会降级成macroTimerFunc
if (typeof Promise !== 'undefined' && isNative(Promise)) {
    const p = Promise.resolve()
    microTimerFunc = () => {
        p.then(flushCallbacks)
    }
} else {
    microTimerFunc = macroTimerFunc
}

export function withMacroTask(fn) {
    return fn._withTask || (fn._withTask = function () {
        useMacroTask = true
        const res = fn.apply(null, arguments)
        useMacroTask = false
        return res
    })
}

// 官方文档有这么一句话，如果没有提供回调且在支持Promise的环境中，则返回一个Promise
/**
 * this.$nextTick().then(function(){})
*/
export function nextTick(cb, ctx) {
    let _resolve
    // 向callbacks存储要执行的回调
    callbacks.push(() => {
        if (cb) {
            cb.call(ctx)
        } else if (_resolve) {
            _resolve(ctx)
        }
    })
    // pengding标记是否向任务队列中添加了任务，如果添加了任务之后，则只存储回调，因为microTimerFunc是异步的，所以可以存储回调
    if (!pengding) {
        pengding = true
        if (useMacroTask) {
            macroTimerFunc()
        } else {
            microTimerFunc()
        }
    }
    if (!cb && typeof Promise !== 'undefined') {
        return new Promise((resolve, reject) => {
            _resolve = resolve
        })
    }
}