import { remove } from "../observe/dep"

export function lifecycleMixin(Vue) {
    // vm.$forceUpdate是迫使Vue.js实例重新渲染
    Vue.prototype.$forceUpdate = function () {
        // vue是通过收集依赖，触发依赖更新，依赖就是watch
        const vm = this
        // vm._watcher 是在new Vue的时候生成的
        if (vm._watcher) {
            // vm._watcher就是组件实例上的watch 
            vm._watcher.update()
        }
    }

    /*
         vm.$destory 是完全销毁一个实例，
         他会清理该实例与其他实例的连接，并解绑其全部指令及监听器，同时会触发beforeDestory 和 destoryed的钩子函数
    */
    Vue.prototype.$destory = function (params) {
        const vm = this
        // 防止vm.$destory反复执行99999999999999999
        if (vm._isBeingDestroyed) {
            return
        }
        // 触发beforeDestory的钩子函数
        callHook(vm, 'beforeDestory')
        vm._isBeingDestroyed = true

        // vm._watcher 是在new Vue的时候生成的,从watcher监听的所有状态的依赖列表中移除watcher
        if (vm._watcher) {
            vm._watcher.teardown()
        }

        // 删除自己与父级之间的连接,就是在自己的父亲的children删掉这个实例
        const parent = vm.$parent
        // parent 存在 parent没有被删除 并且不是抽象组件
        // 抽象组件  在Vue中，像<keep-alive>, <transition>,<slot>这些都是内置的抽象组件，抽象组件和普通的组件类似，只是他们添加额外的行为，不向DOM呈现任何内容。
        if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
            remove(parent.$children, vm)
        }

        // 用户自己创建的watch，是在vm._watchers中
        let i = vm._watchers.length
        while (i--) {
            vm._watchers[i].teardown()
        }

        // 添加_isDestroyed表示已经被销毁
        vm._isDestroyed = true

        // 在vnode树上触发destory钩子函数解绑指令
        vm.__patch__(vm._vnode, null)
        //触发destroyed钩子函数
        callHook(vm, 'destoryed')
        vm.$off()
    }
}