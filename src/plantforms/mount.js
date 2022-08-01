import { extend } from "../utils"

// 获取dom元素
function query(el) {
    if (typeof el === 'string') {
        const selected = document.querySelector(el)
        if (!selected) {
            return document.createElement('div')
        }
        return selected
    } else {
        return el
    }
}

// 返回提供的DOM元素的HTML字符串
function getOuterHTML(el) {
    if (el.outerHTML) {
        return el.outerHTML
    } else {
        const container = document.createElement('div')
        container.appendChild(el.cloneNode(true))
        return container.innerHTML
    }
}

// 通过id获取模板
function idToTemplate(id) {
    const el = query(id)
    return el && el.innerHTML
}

function compileToFunctions(template, options, vm) {
    options = extend({}, options)
    // 检查缓存
    const key = options.delimiters ? String(options.delimiters) + template : template
    if (cache[key]) {
        return cache[key]
    }
    // 编译
    const complied = complie(template, options)
    // 将代码字符串转换为函数
    const res = {}
    res.render = createFunction(complied.render)
    return (cache[key] = res)
}

function createFunction(code) {
    return new Function(code)
}


/**
 * 想让Vue.js实例具有关联的DOM元素，只有使用vm.$mount方法这一途径
 * vm.$mount([elementOrSelector])
 * 用法：如果vue实例在实例化时没有收到el选项，则他处于未挂载状态。没有关联的DOM元素。我们可以手动vm.$mount挂载一个未挂载的实例。如果没有提供elementOrSelector参数，模板将被渲染为文档之外的元素，并且必须使用原生DOM的API把他插入文档中，这个方法返回实例自身，因而可以链式调用其他实例方法
 * 示例： var MyCompoent = Vue.extends({
 *          template:'<div>13</div>'   
 *       })
 *       new MyCompoent().$mount(#app)
 *       new MyCompoent({el:#app})
 *       var compoent = new MyCompoent()
 *       document.getElementById('app').appendChild(compoent.$el)
*/

/**
 * 完整版和运行时版之间的差异主要在于是否有编译器，而是否有编译器的差异主要在于vm.$mount方法的表现形式。
 * 在只包含运行时的构建版本中，vm.$mount的作用如上面介绍，没有编译，默认存在渲染函数，如果不存在则会设置一个。并且返回一个空节点的VNode
 * 完整版，他首先会检查template和el选项所提供的模板是否已经转换成渲染函数。如果没有，编译，在挂载 渲染
*/

// 完整版
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (el) {

    // 第一步 通过el获取DOM元素
    el = el && query(el)

    // 判断是否存在渲染函数，只有不存在时，才会将模板编译成渲染函数
    const options = this.$options
    if (!options.render) {
        // 将模板编译成渲染函数并赋值给options.render
        let template = options.template
        // 如果用户没有通过template选项设置模板，那么会从el选项中获取HTML字符串当作模板。如果用户提供了template选项，那么需要对他进一步解析
        if (template) {
            // 新增解析模板逻辑
            if (typeof template === 'string') {
                // 如果template是字符串并以#开头，则它被用作选择符，通过选择符获取DOM元素后，会使用innerHTML作为模板
                // 不是以#开头，就说明template是用户设置的模板，不需要进行处理，直接使用即可
                if (template.charAt(0) === '#') {
                    template = idToTemplate(template)
                }
            } else if (template.nodeType) {
                // 如果template不是字符串，则判断是不是DOM元素，如果是，则使用DOM元素的innerHTNL作为模板，通过template.nodeType来判断
                template = template.innerHTML
            } else {
                // 如果不是字符串和DOM元素 ，则会警告
                if (process.env.NODE_ENV !== 'production') {
                    console.warn('invalid template option:' + template, this)
                }
                return this
            }
        } else if (el) {
            // 返回参数中提供的DOM元素的HTML字符串
            template = getOuterHTML(el)
        }

        // 新增编译相关逻辑
        if (template) {
            const { render } = compileToFunctions(
                template,
                { ...},
                this
            )
            options.render = render
        }
    }

    return mount.call(this, el)
}

// 运行时的版本
Vue.prototype.$mount = function (el) {
    var inBrowser = typeof window !== 'undefined';
    el = el && inBrowser ? query(el) : undefined
    return mountComponent(this, el)
}

export function mountComponent(vm, el) {
    if (!vm.$options.render) {
        vm.$options.render = createEmptyVNode
        if (process.env.NODE_ENV !== 'production') {
            // 在开发环境发出警告
        }
    }
    // 触发生命周期钩子
    callHook(vm, 'beforeMount')
    // 挂载
    vm._watcher = new Watcher(vm, () => {
        vm._update(vm.render())
    }, noop)

    // 触发生命周期钩子
    callHook(vm, 'mounted')

    return vm
}