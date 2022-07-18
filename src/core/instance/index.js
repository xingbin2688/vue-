import { initMixin } from "./init"
import { stateMixin } from './state'
import { lifecycleMixin } from './lifecycle'

function Vue(options) {
    if (!(this instanceof Vue)) {
        console.warn('Vue得实例化')
        return
    }
    // 初始化Vue实例上一些属性和方法
    this._init(options)
}

// 向Vue的原型中挂载方法
initMixin(Vue)
// 挂载数据相关实例方法 set del watch
stateMixin(Vue)
// 生命周期相关的实例方法  vm.$forceUpdate vm.$destroy  这两个是在 lifecycle文件中   vm.$mount   vm.$nextTick
lifecycleMixin(Vue)
export default Vue