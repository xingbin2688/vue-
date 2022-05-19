// 不同类型的vnode实例表示不同类型的DOM元素,描述了怎样创建真实DOM元素
export default class VNode {
    constructor(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
        this.tag = tag // 元素节点名称
        this.data = data
        this.children = children // 子节点
        this.text = text //文本节点的文本
        this.elm = elm
        this.ns = undefined
        this.context = context
        this.functionalContext = undefined
        this.functionalOptions = undefined
        this.functionalScopeId = undefined
        this.key = data && data.key
        this.componentOptions = componentOptions
        this.componentInstance = undefined
        this.parent = undefined
        this.raw = false
        this.isStatic = false
        this.isRootInsert = true
        this.isComment = false
        this.isCloned = false
        this.isOnce = false
        this.asyncFactory = asyncFactory
        this.asyncMeta = undefined
        this.isAsyncPlaceholder = false
    }

    get child() {
        return this.componentInstance
    }
}


/**
 * VNode类型 注释节点 文本节点 元素节点 组件节点 函数式组件 克隆节点
*/

// 注释节点
/**
 * <!-- 注释节点 -->
 * vnode {
 *  text: '注释节点',
 *  isComment : true
 * }
*/
export const cerateEmptyVNode = text => {
    const node = new VNode()
    node.text = text
    node.isComment = true
    return node
}

// 文本节点
/**
 * {
 *  text:'hello world'
 * }
*/
export const cerateTextVNode = text => {
    return new VNode(undefined, undefined, undefined, String(val))
}

// 克隆节点
/**
 * 新创建的节点和被克隆节点的属性保持一致，作用是优化静态节点和插槽节点。
 * 当组件内的状态发生变化，静态节点通过克隆，变不需要在执行渲染函数重新生成vnode，提升性能
 * 唯一区别是克隆的isCloned为true,原始的为false
*/

export function cloneVNode(vnode, deep) {
    const cloned = new VNode(
        vnode.tag,
        vnode.data,
        vnode.children,
        vnode.text,
        vnode.elm,
        vnode.context,
        vnode.componentOptions,
        vnode.asyncFactory
    )
    cloned.ns = vnode.ns
    cloned.isStatic = vnode.isStatic
    cloned.key = vnode.key
    cloned.isComment = vnode.isComment
    cloned.isCloned = true
    if (deep && vnode.children) {
        cloned.children = cloneVNodes(vnode.children)
    }
    return cloned
}

export function cloneVNodes(vnodes) {
    const res = new Array(vnodes.length)
    for (let i = 0; i < res.length; i++) {
        res[i] = cloneVNode(res[i], true);
    }
    return res
}

// 元素节点
/**
 * 通常会有以下4种有效属性
 * tag: 节点名称
 * data: 节点数据，比如attrs、class 和 style等
 * children: 当前节点子节点
 * context: 他是当前组件的Vue.js实例
 * <p> <span> hello </span> <span> world </span> </p>
 * {
 *  children:[VNode,VNode],
 *  context: {...},
 *  data:{...},
 *  tag: {'p'},
 *  ...
 * }
*/

// 组件节点
/**
 * 组件节点和元素节点类似，有两个独有属性
 * componentOptions:组件节点的选项参数，其中包含propsData , tag 和 children等信息
 * componentInstance:组件的实例，也是Vue.js的实例。事实上，每个组件都是一个Vue.js实例
 * <child> </child>
 * {
 *  componentOptions:{...},
 *  componentInstance:{...},
 *  context: {...},
 *  data: {...},
 *  tag:'vue-component-1-child',
 *  ...
 * }
*/

// 函数式组件
/**
 * 函数式组件和组件节点类似，有两个独有属性：functionalContext 和 functionalOptions
 * {
 *  functionalContext:{...},
 *  functionalOptions:{...},
 *  context: {...},
 *  data: {...},
 *  tag:'div',
 * }
*/