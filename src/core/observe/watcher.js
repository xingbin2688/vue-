// 当data.a.b.c发生变化，执行后面的函数
/*
  vm.$watch(a.b.c, function (newVal, oldVal) {
   // 做点什么
   })
*/
import parsePath from '../../utils/index'
export default class Watcher {
    constructor(vm, expOrFn, cb) {
        this.vm = vm
        this.getter = parsePath(expOrFn) // this.getter是一个获取this.vm下的值的函数 如：获取this.vm.a.b.c的值的函数
        this.cb = cb
        this.value = this.get()
    }

    get() {
        window.target = this
        let value = this.getter.call(this.vm, this.vm) // 此时会触发this.vm.a.b.c的getter,收集依赖，并且this.value 会保存当前值
        window.target = undefined
        return value
    }
    // 触发更新
    update() {
        const oldValue = this.value
        this.value = this.get()
        this.cb.call(this.vm, this.value, oldValue)
    }
}