/**
 * Vue.extend(options)
 * 用法：使用基础Vue构造器创建一个‘子类’，其参数是一个包含‘组件选项’的对象。
 * data选项是特例，在Vue.extend()中，他必须是函数
 * 
 * <div id="mount-point"></div>
 * //创建构造器
 * var Profile = Vue.extend({
 *      template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
 *      data: function() {
 *          return {
 *              firstName: 'Walter',
 *              lastName: 'White',
 *              alias: 'Heisenberg'
 *          }
 *      }
 * })
 * 
 * new Profile().$mount('#mount-point')
*/
let cid = 1
Vue.extend = function (extendOptions) {
    extendOptions = extendOptions || {}
    const Super = this
    const SuperId = Super.cid
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
        return cachedCtors[SuperId]
    }

    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production') {
        if (!/^[a-zA-Z][\w-]*$/.test(name)) {
            console.warn('xx')
        }
    }
    const Sub = function VueCompoent(options) {
        this._init(options)
    }
    // 将父类的原型继承到子类中
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.contructor = Sub
    Sub.cid = cid++

    // 将父类的options选项继承到子类中  这里合并了父类选项和子类选项的逻辑，并将父类保存到了子类的super属性中
    Sub.options = mergeOptions(Super.options, extendOptions)
    Sub['super'] = Super

    // 如果选项中存在props，则初始化他
    if (Sub.options.props) {
        initProps(Sub)
    }
    // 如果选项中存在computed，则初始化他
    if (Sub.options.computed) {
        initComputed(Sub)
    }

    // 这里赋值到子类的方法包括extend mixin use component directive filter 同时在子类上新增了superOptions extendOptions sealedOptions 
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use


    // ASSET_TYPES = ['component','directive','filter']
    ASSET_TYPES.forEach(function (type) {
        Sub[type] = Super[type]
    })

    if (name) {
        Sub.options.components[name] = Sub
    }


    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)



    // 缓存构造函数
    cachedCtors[SuperId] = Sub
    return Sub
}



function initProps(Comp) {
    const props = Comp.options.props
    for (const key in props) {
        proxy(Comp.prototype, `_props`, key)
    }
}

function initComputed(Comp) {
    const computed = Comp.options.computed
    for (const key in computed) {
        defineComputed(Comp.prototype, key, computed[key])
    }
}