// Vue.mixin(mixin)
// 用法： 全局注册一个混入，影响注册之后创建的每个Vue.js实例。插件作者可以使用混入向组件注入自定义行为（例如：监听生命周期钩子）。不推荐在应用代码中使用
/**
 * Vue.mixin({
 *    created() {
 *       var myOption = this.$options.myOption
 *       if(myOption) { 
 *          console.log(myOption)
 *       }
 *    }
 * })
 * 
 * new Vue({
 *  myOptions: 'hello'
 * })
*/

// Vue.mixin方法注册后，会影响之后创建的每个Vue.js实例，因为该方法会更改Vue.options属性
export function initMixin(Vue) {
    Vue.mixin = function (mixin) {
        this.options = mergeOptions(this.options,mixin)
        return this
    }
}