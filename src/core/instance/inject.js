// inject和provide选项需要一起使用，他们允许祖先组件向其所有子孙后代注入依赖，并在其上下游关系成立的时间始终生效（不论组件层级有多深）
export function initInjections(vm) {
    const result = resolveInject(vm.$options.inject, vm)
    if (result) {
        // 通知是否转换 响应式  false 否  true 是
        observerState.shouldConvert = false
        Object.keys(result).forEach(key => {
            defineReactive(vm, key, result[key])
        })
        observerState.shouldConvert = true
    }
}

export function resolveInject(inject, vm) {
    if (inject) {
        const result = Object.create(null)
        // 支持symbol格式
        const keys = hasSymbol
            ? Reflect.ownKeys(inject).filter(key => {
                return Object.getOwnPropertyDescriptor(inject, key).enumerable
            })
            : Object.keys(inject)

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const provideKey = inject[key].form
            let source = vm
            while (source) {
                if (source._provided && provideKey in source._provided) {
                    result[key] = source._provided[provideKey]
                    break
                }
                source = source.$parent
            }
            if (!source) {
                if ('default' in inject[key]) {
                    const provideDefault = inject[key].provideDefault
                    result[key] = typeof provideDefault === 'function'
                        ? provideDefault.call(vm)
                        : provideDefault
                }  else {
                    console.warn('xxx')
                }
            }

        }

        return result
    }
}
