/**
 * Vue.filter(id,[definition])
 * Vue.filter('my-filter',function(value) {
 *      返回处理后的值
 * })
 * 
 * 返回已注册的过滤器
 * var myFilter = Vue.filter('my-filter)
*/


// Vue.js允许自定义过滤器，可被用于一些常见的文本格式化，过滤器可以用在两个地方：双花括号插值和v-bind表达式。
// 过滤器应该被添加在JS表达式的尾部，由管道符号指示：
/**
    {{ message | capitalize}}
    <div v-bind:id="rawId | formatId"></div>
*/

Vue.options['filters'] = Object.create(null)

Vue.filter = function (id, definition) {
    if (!definition) {
        // 读取
        return this.options['filters'][id]
    } else {
        this.options['filters'][id] = definition
        return definition
    }
}