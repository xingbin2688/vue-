// Dep类 管理依赖  收集依赖，触发依赖，删除依赖
let uid = 0
export default class Dep {
    constructor() {
        this.subs = []
        this.id = uid++ // 创建dep Id
    }
    // 添加依赖
    addSub(sub) {
        this.subs.push(sub)
    }

    depend() {
        if (window.target) {
            // 调用watch的方法，实现watcher 和 dep 互相订阅
            window.target.addDep(this)
        }
    }
    // 触发依赖
    notify() {
        const subs = this.subs.slice()
        for (let index = 0; index < subs.length; index++) {
            subs[index].update()

        }
    }
    // 删除依赖
    removeSub(sub) {
        remove(this.subs, sub)
    }
}

export function remove(arr, item) {
    if (arr.length) {
        const index = arr.indexOf(item)
        if (index > -1) {
            return arr.splice(index, 1)
        }
    }
}