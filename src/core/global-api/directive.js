/*
* Vue.directive(id,[definition])
Vue.directive('my-directive',{
    bind: funcion() {},
    inserted: function() {},
    update: function() {},
    componentUpdated: function() {},
    unbind: function() {}
})
*/

// 注册 指令函数
Vue.directive('my-directive', function () {
    // 这里将会被bind和update调用
})

var myDirective = Vue.directive('my-directive')

// 这里需要强调Vue.directive方法的作用是注册或获取全局指令，而不是让指令生效。其区别是注册指令需要做的事是将指令保存在某个位置，而让指令生效是将指令从某个位置拿出来执行它。
Vue.options = Object.create(null)
Vue.options['directive'] = Object.create(null)

Vue.directive = function (id, definition) {
    if (!definition) {
        // 读取
        return this.options['directive'][id]
    } else {
        if (typeof definition === 'function') {
            definition = { bind: definition, update: definition }
        }
        this.options['directive'][id] = definition
        return definition
    }
}