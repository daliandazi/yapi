const { Controller, Post } = require('../router/decorator');
const yapi = require('../yapi.js');
const interfaceModel = require('../models/interface.js');
const projectModel = require('../models/project.js');
const baseController = require('./base.js');
@Controller('/api/search')
class SearchController extends baseController {
    constructor(ctx) {
        super(ctx);
    }

    @Post('/')
    async search(ctx) {
        let keyWord = ctx.request.body.keyWord;
        let limit = ctx.request.body.limit || 10;
        let page = ctx.request.body.page || 1;

        let total = await yapi.getInst(interfaceModel).searchCount(keyWord);
        let interfaceList = await yapi.getInst(interfaceModel).search(keyWord, page, limit);

        let resultList = [];
        for (let i in interfaceList) {
            let interfaceObj = interfaceList[i];
            let project = await yapi.getInst(projectModel).get(interfaceObj.project_id);
            let iObj = interfaceObj.toObject()
            if(project){
                console.log(project.toObject().name)
                iObj.project_name = project.toObject().name
            }
            resultList.push(iObj)
        }


        let index = ((page - 1) * limit + limit)
        let hasMore = false;
        if (index >= total) {
            hasMore = false
        } else {
            hasMore = true
        }

        return (ctx.body = yapi.commons.resReturn({
            interfaceData: {
                list: resultList,
                total: total,
                hasMore: hasMore,
                page: page,
                limit: limit
            }
        }));
    }
}
