const {
    parse,
    stringify,
    assign
} = require('comment-json')
const Mock = require('mockjs');

// let objs = [{ "name": "code", "key": "0-0", "desc": "", "required": false, "type": "integer", "sub": { "mock": "0" } }, { "name": "message", "key": "0-1", "desc": "", "required": false, "type": "string", "sub": {} }, { "name": "data", "key": "0-2", "desc": "FmPlayListResult", "required": false, "type": "object", "children": [{ "name": "header", "key": "0-2-0", "desc": "Header", "required": false, "type": "object", "children": [{ "name": "moreDisplay", "key": "0-2-0-0", "desc": "是否展示更多", "required": false, "type": "integer", "sub": {} }, { "name": "moreRouter", "key": "0-2-0-1", "desc": "更多的跳转路由 ,Router", "required": false, "type": "object", "children": [{ "name": "page", "key": "0-2-0-1-0", "desc": "", "required": false, "type": "string", "sub": {} }, { "name": "source", "key": "0-2-0-1-1", "desc": "", "required": false, "type": "string", "sub": {} }, { "name": "needLogin", "key": "0-2-0-1-2", "desc": "", "required": false, "type": "boolean", "sub": {} }, { "name": "hasLock", "key": "0-2-0-1-3", "desc": "", "required": false, "type": "boolean", "sub": {} }] }, { "name": "moreText", "key": "0-2-0-2", "desc": "右上角展示的文字", "required": false, "type": "string", "sub": {} }] }, { "name": "list", "key": "0-2-1", "desc": "播放列表 ,FmStoryResult", "required": false, "type": "array", "sub": { "itemType": "object" }, "children": [{ "name": "storyid", "key": "0-2-1-0", "desc": "故事Id", "required": true, "type": "integer", "sub": { "mock": "@integer" } }, { "name": "storyname", "key": "0-2-1-1", "desc": "故事名称", "required": true, "type": "string", "sub": { "mock": "@string" } }, { "name": "iconurl", "key": "0-2-1-2", "desc": "iconUrl", "required": true, "type": "string", "sub": { "mock": "@image" } }, { "name": "timetext", "key": "0-2-1-3", "desc": "故事时长", "required": false, "type": "string", "sub": { "mock": "@string" } }, { "name": "playcount", "key": "0-2-1-4", "desc": "播放次数", "required": false, "type": "integer", "sub": {} }, { "name": "productid", "key": "0-2-1-5", "desc": "商品Id", "required": false, "type": "integer", "sub": {} }, { "name": "ablumid", "key": "0-2-1-6", "desc": "专辑Id", "required": false, "type": "integer", "sub": {} }, { "name": "canPlay", "key": "0-2-1-7", "desc": "是否能够播放1可以，0不可以", "required": false, "type": "integer", "sub": {} }, { "name": "canFavorite", "key": "0-2-1-8", "desc": "是否能收藏1可以，0不可以", "required": false, "type": "integer", "sub": {} }, { "name": "favoriteStatus", "key": "0-2-1-9", "desc": "收藏状态1已收藏，0未收藏", "required": false, "type": "integer", "sub": {} }, { "name": "coverRTIcon", "key": "0-2-1-10", "desc": "封面图右上角角标", "required": false, "type": "string", "sub": {} }] }] }]

function parsedJson(json) {
    let result = interfaceJsonHandler(json)
    result = "{\n" + result + "\n}"
    try {
        return stringify(parse(result), null, 4)
    } catch (e) {
        console.error(e, result)
    }
    return "{}";
}

function interfaceJsonHandler(json, container) {
    container = container || ""
    json.map((data) => {
        if (data.desc && data.desc.replace) {
            data.desc = data.desc.replace("\n", "。")
        }
        if (data.children) {
            let child = "";
            child = interfaceJsonHandler(data.children, child)
            if (data.type == "object") {
                // child = "{"+child+"}"
                child = `"${data.name}":{ // ${data.desc} \n ${child} }, `;
            } else if (data.type == "array") {
                // child = "["+child+"]"
                child = `"${data.name}":[ // ${data.desc} \n { ${child} }], `;
            }

            // let f = `"${data.name}":{ // ${data.desc} \n ${child} }, `;
            container += child + "\n";
        } else {
            if (data.name) {
                let value = "";
                if (data.sub && data.sub.mock) {
                    value = Mock.mock(data.sub.mock)
                } else {
                    value = customMock(data.name, data.type)
                }
                let f = "";
                if (data.type == 'number') {
                    f = `"${data.name}":${value}, // ${data.desc}`
                } else {
                    f = `"${data.name}":"${value}", // ${data.desc}`
                }
                container += f + "\n";
            }

        }
    })
    // container = "{\n" + container +"\n}"
    return container;

}

function customMock(field, type) {
    if (field === 'code' || field === 'errcode') {
        return 0;
    }
    if (type === 'number') {
        return Mock.Random.integer(0, 100)
    }
    return Mock.mock("@" + type)
}

module.exports = parsedJson;
// console.log(parsedJson(objs))