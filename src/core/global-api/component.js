/**
 * Vue.component(id,[definition])
 * 
 * 注册组件，传入一个扩展过的构造器
 * Vue.component('my-compoent',Vue.extend({xxx}))
 * 
 * 注册组件，传入一个选项对象（自动调用Vue.extend）
 * Vue.component('my-component',{xxx})
 * 
 * 获取注册的组件（始终返回构造器）
 * var MyComponent = Vue.component('my-component')
*/

// Vue.component只是注册或获取组件。
Vue.options['components'] = Object.create(null)

Vue.filter = function (id, definition) {
    if (!definition) {
        // 读取
        return this.options['components'][id]
    } else {
        if (isPlainObject(definition)) {
            definition.name = definition.name || id
            definition = Vue.extend(definition)
        }
        this.options['components'][id] = definition
        return definition
    }
}