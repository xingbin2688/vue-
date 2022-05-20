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
let allHtml = '<div class="box" id="el"></div>'
const start = allHtml.match(startTagOpen)
if (start) {
    let end, attr
    const match = {
        tagName: start[1],
        attrs: []
    }
    let html = allHtml.substring(start[0].length)
    while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        html = html.substring(attr[0].length)
        match.attrs.push(attr)
    }
    console.log(match)
    /**
     * {
         "tagName": "div",
             "attrs": [
                 [
                     " class=\"box\"",
                     "class",
                     "=",
                     "box",
                     null,
                     null
                 ],
                 [
                     " id= \"el\"",
                     "id",
                     "=",
                     "el",
                     null,
                     null
                 ]
             ]
     }*/
    console.log(html)
    /**
     * ></div>
    */
    // end ['>', '', index: 0, input: '></div>', groups: undefined]
    // 判断是否是自闭合标签
    if (end) {
        match.unarySlash = end[1]
        html = html.substring(end[0].length)
    }
}

const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
'</div>'.match(endTag) // ['</div>', 'div', index: 0, input: '</div>', groups: undefined]
'<div>'.match(endTag) // null

// 条件注释
const conditionalComment = /^<!\[/
let html = `<![if !IE]><link rel="stylesheet" href=""><![endif]>`
if (conditionalComment.test(html)) {
    const conditionalEnd = html.indexOf(']>')
    if (conditionalEnd >= 0) {
        html = html.substring(conditionalEnd + 2)
        console.log(html) // <link rel="stylesheet" href=""><![endif]>
    }
}