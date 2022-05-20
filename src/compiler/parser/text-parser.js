// 解析文本，如果是纯文本 直接返回，如果有{{xxx}} 这样语法 返回'_s(xxx)'
export function parseText(text) {
    const tagRE = /\{\{((?:.|\n)+?)\}\}/g
    // 如果是纯文本，直接返回
    if (!tagRE.test(text)) {
        return
    }
    const tokens = []
    let lastIndex = tagRE.lastIndex = 0
    let match, index
    while ((match = tagRE.exec(text))) {
        index = match.index
        // 先把{{前面的文本添加到tokens中
        if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)))
        }
        // 把变量改成_s(x)这样的形式也添加到数组中
        tokens.push(`_s(${match[1].trim()})`)
        // 设置lastIndex来保证下一轮循环时，正则表达式不再重复匹配已经解析过的文本
        lastIndex = index + match[0].length
    }
    // 当所有变量抖处理完成后，如果最后一个变量右边还有文本，就将文本添加到数组中
    if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    return tokens.join('+')
}
// parseText('你好{{age}},我叫{{name}}')  '"你好"+_s(age)+",我叫"+_s(name)'
// _s是toString函数别名
function toString(val) {
    return val == null ? '' : typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)
}
