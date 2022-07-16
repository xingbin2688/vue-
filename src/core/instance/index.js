import { initMixin } from "./init"
import { stateMixin } from './state'

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
export default Vue