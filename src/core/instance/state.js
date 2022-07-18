import { set, del } from "../observe/index.js";
import Watcher from "../observe/watcher.js";
// 往Vue原型上挂载set，del，watch
export function stateMixin(Vue) {
    
    Vue.prototype.$set = set
    Vue.prototype.$del = del
    Vue.prototype.$watch = function (expOrFn, cb, options) {
        const vm = this
        options = options || {}
        const watcher = new Watcher(vm, expOrFn, cb, options)
        if (options.immediate) {
            cb.call(vm, watcher.value)
        }
        return function unwatcher() {
            watcher.trardown()
        }
    }



}
