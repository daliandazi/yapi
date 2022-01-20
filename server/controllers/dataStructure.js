const baseController = require('./base.js');
const yapi = require('../yapi.js');
const { Controller, Post, Get } = require('../router/decorator');
const dataStructureModel = require('../models/dataStructure');
const dataStructureGroupModel = require('../models/dataStructureGroup');
const schema = require('../../common/schema-transformTo-table.js');
const parsedJson = require('../../common/json5Comment');

/**
 * 接口定义模板/通用数据结构
 */
@Controller('/api/dataStructure')
class DataStructureController extends baseController {
    constructor(ctx) {
        super(ctx);
        this.Model = yapi.getInst(dataStructureModel);
        this.groupModel = yapi.getInst(dataStructureGroupModel);
    }

    @Post("/group/save")
    async groupSave(ctx) {
        let params = ctx.params;

        if (!params.groupName) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '分组名称必填'));
        }

        params.groupName = params.groupName.trim();

        if (!params.projectId) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '所属项目必填'));
        }

        if (!params.parentId) {
            params.parentId = 0;
        }

        let result;
        if (params._id) {
            result = await this.groupModel.update(params);
        } else {
            result = await this.groupModel.save(params);
        }

        return (ctx.body = yapi.commons.resReturn(result));
    }

    @Post("/group/del")
    async groupDel(ctx) {
        let params = ctx.params;
        if (!params.groupId) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '缺少参数groupId'));
        }

        let result = await this.groupModel.del(params.groupId);
        return (ctx.body = yapi.commons.resReturn(result));
    }

    @Get({ path: "/group/list", auth: true })
    async groupList(ctx) {
        let params = ctx.params;
        if (!params.projectId) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '没有项目参数?'));
        }

        let datas = await this.groupModel.listByProject(params.projectId);

        return (ctx.body = yapi.commons.resReturn(datas));
    }

    @Get("/group/get")
    async getGroup(ctx) {
        const groupId = ctx.params.groupId;
        let data = await this.groupModel.get(groupId);
        return (ctx.body = yapi.commons.resReturn(data));
    }

    @Get("/list")
    async statusCodeList(ctx) {
        let params = ctx.params;
        if (!params.groupId && !params.projectId) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '没有分组参数参数?'));
        }

        let datas = [];
        if (params.groupId) {
            datas = await yapi.getInst(dataStructureModel).listByGroup(params.groupId);
        } else {
            datas = await yapi.getInst(dataStructureModel).listByProject(params.projectId);
        }

        return (ctx.body = yapi.commons.resReturn(datas));
    }

    @Get({ path: '/all' })
    async getAll(ctx) {
        try {
            let params = ctx.params;
            console.log(params)
            if (!params.projectId) {
                return (ctx.body = yapi.commons.resReturn(null, 400, '没有项目参数?'));
            }
            let datas = await this.groupModel.listByProject(params.projectId);
            let groupList = datas;
            let result = [];
            for (let index in groupList) {
                let group = groupList[index];
                group = group.toObject();
                let list = await this.Model.listByGroup(group._id);
                group.children = list;
                result.push(group);
            }
            return (ctx.body = yapi.commons.resReturn(result));
        } catch (e) {
            console.error(e)
            return (ctx.body = yapi.commons.resReturn(null, 400, e));
        }

    }

    @Get('/getById')
    async getStatucCode(ctx) {
        let id = ctx.params.id
        if (!id) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '缺少id'));
        }
        let result = await yapi.getInst(dataStructureModel).get(id);
        if (result) {
            result = result.toObject();
            if (result.structure) {
                let structure_json = schema.schemaTransformToTable(JSON.parse(result.structure));
                structure_json = parsedJson(structure_json);
                result.structure_json = structure_json;
            }
        }
        return (ctx.body = yapi.commons.resReturn(result));
    }

    @Post('/del')
    async statusCodeDel(ctx) {
        let id = ctx.params.id
        if (!id) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '缺少id'));
        }
        let result = await yapi.getInst(dataStructureModel).del(id);
        return (ctx.body = yapi.commons.resReturn(result));
    }

    @Post("/save")
    async statusCodeSave(ctx) {
        let params = ctx.params;

        if (!params.groupId) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '分组必填'));
        }

        if (!params.projectId) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '所属项目必填'));
        }

        let count = await this.Model.getCountByCode(params.code, params._id);
        console.log(count)
        if (count > 0) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '状态码已经存在'));
        }
        if (!params.parentId) {
            params.parentId = 0;
        }
        let result = null
        if (params._id) {
            result = await this.Model.update(params._id, params);
        } else {
            result = await this.Model.save(params);
        }
        return (ctx.body = yapi.commons.resReturn(result));
    }
}

module.exports = DataStructureController;