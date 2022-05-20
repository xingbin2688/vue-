/**
 * <div>
 *  <p>{{name}}</p>
 * </div>
 * 解析后的AST
 * {
 *  tag:'div',
 *  type: 1,
 *  staticRoot: false,
 *  static: false,
 *  plain: true,
 *  parent: undefined,
 *  attrsList: [],
 *  attrsMap: {},
 *  children: [{
 *      tag:'p',
 *      type: 1,
 *      staticRoot: false,
 *      static: false,
 *      plain: true,
 *      parent: {tag:'div',...},
 *      attrsList: [],
 *      attrsMap: {},
 *      children:[{
 *          type:2,
 *          text:"{{name}}",
 *          static: false,
 *          expression : '_s(name)'
 *      }]
 *  }]
 * }
*/
import { parseText } from './text-parser.js'

// HTML解析器
parseHTML(template, {
    //unary 是否自闭和 input 和 div
    start(tag, attrs, unary) {
        // 每当解析到标签的开始位置，触发该函数
        // 构建一个元素节点的AST
        let element = createASTElement(tag, attrs, unary)
    },
    end() {
        // 每当解析到标签的结束位置，触发该函数
    },
    chars(text) {
        // 每当解析到文本，触发该函数
        // 构建一个文本节点的AST
        // let element = { type: 3, text }
        text = text.trim()
        if (text) {
            const children = currentParent.children
            let expression
            if (expression = parseText(text)) {
                children.push({
                    type: 2,
                    expression,
                    text
                })
            } else {
                children.push({
                    type: 3,
                    text
                })
            }
        }
    },
    comment(text) {
        // 每当解析到注释，触发该函数
        // 构建一个注释节点的AST
        let element = { type: 3, text, isComment: true }
    }
})

// 在start钩子函数时，可以用这三个参数来构建一个元素类型的AST节点
function createASTElement(tag, attrs, unary) {
    return {
        type: 1,
        tag,
        attrsList: attrs,
        parent,
        children: []
    }
}

function advance(n) {
    html = html.substring(n)
}

// 通过正则来分辨模板的开始位置是否符合开始标签的特征，只是匹配开始标签的标签名
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
/**
 * '<div></div>'.match(startTagOpen) // ['<div', 'div', index: 0, input: '<div></div>', groups: undefined]
*/
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const startTagClose = /^\s*(\/?)>/


// 解析HTML标签属性
// let html = ' class="box" id="el"></div>'
// let attr = html.match(attribute) [' class="box"', 'class', '=', 'box', undefined, undefined, index: 0, input: ' class="box" id="el"></div>', groups: undefined]

const comment = /^<!--/   // 截取注释并处理
const conditionalComment = /^<!\[/   // 截取条件注释，直接截取 
const doctype = /^<!DOCTYPE[^>]+>/i  // 截取DOCTYPE
// 解析开始标签，分为三部分，标签名，属性，结尾
function parseStartTag() {
    // 解析标签名，判断模板是否符合开始标签的特征
    const start = html.match(startTagOpen)
    if (start) {

        const match = {
            tagName: start[1],
            attrs: []
        }
        advance(start[0].length)

        // 解析标签属性
        let end, attr
        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            html = html.substring(attr[0].length)
            match.attrs.push(attr)
        }

        // 判断该标签是否是自闭合标签
        if (end) {
            match.unarySlash = end[1]
            advance(end[0].length)
            return match
        }
    }
}
const reCache = {}

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
let lastTag
export function parseHTML(html, options) {
    while (html) {
        // 截取模板字符串并触发钩子函数
        // 父级元素是不是 纯文本内容元素 父元素不存在或者不是纯文本内容
        if (!lastTag || !isPlainTextElement(lastTag)) {
            // 父元素为正常元素的处理逻辑
            // 除了文本之外，其他都是以标签形式存在，而标签是以<开头
            let textEnd = html.indexOf('<')
            if (textEnd === 0) {
                // 截取注释并处理

                if (comment.test(html)) {
                    const commentEnd = html.indexOf('-->')
                    if (commentEnd >= 0) {
                        if (options.shouldKeepComment) {
                            options.comment(html.substring(4, commentEnd))
                        }
                        html = html.substring(commentEnd + 3)
                        continue
                    }
                }

                // 截取条件注释，直接截取 

                if (conditionalComment.test(html)) {
                    const conditionalEnd = html.indexOf(']>')
                    if (conditionalEnd >= 0) {
                        html = html.substring(conditionalEnd + 2)
                        continue
                    }
                }

                // 截取DOCTYPE

                const doctypeMatch = html.match(doctype)
                if (doctypeMatch) {
                    html = html.substring(doctypeMatch[0].length)
                    continue
                }


                // 截取结束标签并处理
                const endTagMatch = html.match(endTag)
                if (endTagMatch) {
                    html = html.substring(endTagMatch[0].length)
                    options.end(endTagMatch[1])
                    continue
                }

                // 截取开始标签并处理
                const startTagMatch = parseStartTag()
                if (startTagMatch) {
                    handleStartTag(startTagMatch)
                    continue
                }

            }


            // 截取文本
            let text, rest, next

            if (textEnd >= 0) {
                rest = html.slice(textEnd)
                // 防止1<2<3 这种
                while (
                    !endTag.test(rest) &&
                    !startTagOpen.test(rest) &&
                    !comment.test(rest) &&
                    !conditionalComment.test(rest)
                ) {
                    // 如果<在纯文本中，将它视为纯文本对待,
                    // rest 开头就是<,所以第二个参数是1
                    next = rest.indexOf('<', 1)
                    if (next < 0) break
                    textEnd += next
                    rest = html.slice(textEnd)
                }
                text = html.substring(0, textEnd)
                html = html.substring(textEnd)
            }

            // 如果模板中找不到<，说明整个模板全是文本
            if (textEnd < 0) {
                text = html
            }
            // 触发钩子
            if (options.chars && text) {
                options.chars(text)
            }
        } else {
            // 父元素为script style textarea 的处理逻辑
            const stackedTag = lastTag.toLowerCase()
            const reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'))
            const rest = html.replace(reStackedTag, function (all, text) {
                if (options.chars) {
                    options.chars(text)
                }
                return ''
            })
            html = rest
            options.end(stackedTag)
        }

    }
}