// 当data.a.b.c发生变化，执行后面的函数
/*
  vm.$watch(a.b.c, function (newVal, oldVal) {
   // 做点什么
   })
*/
/**
 * watch用法
 * var unwatch = vm.$watch('a',unction (newVal, oldVal) {
   // 做点什么
   },{
       deep: true,
       immediate: true
   })

   Vue.prototype.$watch = function (expOrFn,cb,options) {
       const vm = this
       options = options || {}
       const watcher = new Watcher(vm,expOrFn,cb,options)
       if(options.immediate) {
           cb.call(vm,watcher.value)
       }
       return function unwatcher() {
           watcher.trardown()
       }
   }
*/
/**
 * watch和dep是多对多的关系
 * this.$watch(
 * function() {
 *  return this.age+this.name
 * },
 * function(newValue,oldValue) {
 *  console.log(newValue,oldValue)
 * })
 * this.age+this.name 触发age和name的getter，然后watchrer订阅二者的dep
*/
import { parsePath } from '../../utils/index.js'
import { traverse } from './traverse.js'
export default class Watcher {
    constructor(vm, expOrFn, cb, options) {
        // 每当创建watch实例时，都将watch实例添加到vm._watchers中
        vm._watchers.push(this)

        this.vm = vm
        // deep处理，就是让expOrFn对应的下面的值都触发getter，来订阅这个watcher
        if (options) {
            this.deep = !!options.deep
        } else {
            this.deep = false
        }
        // 记录订阅了哪些dep，当取消监听时，告诉这些dep，删除这些watch
        this.deps = []
        this.depIds = new Set()
        if (typeof expOrFn === 'function') {
            this.getter = expOrFn
        } else {
            this.getter = parsePath(expOrFn) // this.getter是一个获取this.vm下的值的函数 如：获取this.vm.a.b.c的值的函数
        }

        this.cb = cb
        this.value = this.get()
    }

    get() {
        window.target = this
        let value = this.getter.call(this.vm, this.vm) // 此时会触发this.vm.a.b.c的getter,收集依赖，并且this.value 会保存当前值
        if (this.deep) {
            traverse(value)
        }
        window.target = undefined
        return value
    }
    // 触发更新
    update() {
        const oldValue = this.value
        this.value = this.get()
        this.cb.call(this.vm, this.value, oldValue)
    }


    // 记录dep,并通知dep存取watcher实例,只有第一次触发getter时才会收集依赖
    addDep(dep) {
        const id = dep.id
        if (!this.depIds.has(id)) {
            this.depIds.add(id)
            this.deps.push(dep)
            dep.addSub(this)
        }
    }

    // 取消监听，从所有依赖项将自己移除
    trardown() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].removeSub(this)
        }
    }
}

