import { nextTick } from '../../utils/index.js'
export function renderMixin(Vue) {
    // nextTick接收一个回调函数作为参数，作用是将回调延迟到下次DOM更新周期之后执行。如果没有提供回调且在支持Promise，则返回一个Promise
    /**
     * 下次DOM更新周期之后? 在vue中，当状态发生变化，watcher会得到通知，然后触发虚拟DOM的渲染流程。watcher触发渲染不是同步上的，而是异步的。Vue有一个队列，每当需要渲染时，会将watcher推到这个队列，在下一次事件循环中再让watcher触发渲染的流程
     * 下次DOM更新周期的意思就是下次微任务执行时更新DOM。而vm.$nextTick其实是将回调添加到微任务中，只有特殊情况下降级到宏任务
     * 因此，使用vm.$nextTick来获取更新后额DOM，需要注意顺序问题。因为都是向微任务队列添加任务
     * 事实上，更新DOM的回调也是使用vm.$nextTick注册到微任务中
     * */
    // vm.$nextTick和Vue.nextTick是相同的，就抽象成一个方法供两个方法使用
    /**
     * 由于vm.$nextTick会将任务添加到队列延迟执行，所以在回调执行前，如果反复调用vm.$nextTick Vue并不会反复将回调添加到任务队列中，只会添加一个任务，此外会有一个列表来存储vm.$nextTick提供的回调，当任务触发时，依次执行列表的回调并清空列表
    */
    Vue.prototype.$nextTick = function (fn) {
        return nextTick(fn, this)
    }
}