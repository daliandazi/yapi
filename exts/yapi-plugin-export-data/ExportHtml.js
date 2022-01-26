const fs = require('fs');
const path = require('path');
const ejs = require('ejs')
const schema = require('../../common/schema-transformTo-table.js');

async function exportHtml(curProject, wikiData, datas) {
    // console.log(datas)
    let menuData = datas.map((data) => {
        // console.log(data)
        let children = data.list.map((intefaceObj) => {
            return {
                id: intefaceObj._id,
                name: intefaceObj.title,
                path: intefaceObj.path
            }
        })
        return {
            id: data._id,
            index: data.index,
            name: data.name,
            parentId: data.parent_id,
            children: children || []
        }
    })

    let intefaces = {};
    for (let i in datas) {
        let data = datas[i];

        // console.log(data.list)
        let children = data.list.map((intefaceObj) => {
            // console.log(intefaceObj)
            let api = {
                id: intefaceObj._id,
                data: {
                    title: intefaceObj.title,
                    method: intefaceObj.method,
                    req_params: intefaceObj.req_params,
                    res_body_type: intefaceObj.res_body_type,
                    path: intefaceObj.path,
                    req_query: intefaceObj.req_query,
                    req_body_form: intefaceObj.req_body_form,
                    req_body_other: intefaceObj.req_body_other,
                    desc: intefaceObj.desc

                }
            }
            if (intefaceObj.res_body && intefaceObj.res_body_type == 'json') {
                let dataSource = schema.schemaTransformToTable(JSON.parse(intefaceObj.res_body));
                // console.log(dataSource)
                if (dataSource) {
                    api.data.res_body = dataSource
                    // console.log(api)
                }
            }

            if(intefaceObj.req_body_other){
                let dataSource = schema.schemaTransformToTable(JSON.parse(intefaceObj.req_body_other));
                // console.log(dataSource)
                if (dataSource) {
                    api.data.req_body_other = dataSource
                    // console.log(api)
                }
            }

            intefaces[intefaceObj._id] = api;
        })
    }

    let css = fs.readFileSync(path.resolve('exts/yapi-plugin-export-data/index.css'), 'utf-8');

    let s = await ejs.renderFile(path.resolve('exts/yapi-plugin-export-data/html-template.html'), {
        curProject: curProject,
        datas: datas,
        menuData: menuData,
        intefaces: intefaces,
        wikiData: wikiData,
        css: css
    }, {});
    return s;
}

module.exports = {
    exportHtml: exportHtml
};
