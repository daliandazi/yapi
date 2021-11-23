const baseController = require('./base.js');
const yapi = require('../yapi.js');
const statusCodeModel = require('../models/statusCode');
const statusCodeGroupModel = require('../models/statusCodeGroup');
const { Controller, Get, Post, Auth } = require('../router/decorator');

@Controller("/api/statusCode")
class statusCodeController extends baseController {

    constructor(ctx) {
        super(ctx);
        this.Model = yapi.getInst(statusCodeModel);
        this.groupModel = yapi.getInst(statusCodeGroupModel);
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
            datas = await yapi.getInst(statusCodeModel).listByGroup(params.groupId);
        } else {
            datas = await yapi.getInst(statusCodeModel).listByProject(params.projectId);
        }

        return (ctx.body = yapi.commons.resReturn(datas));
    }

    @Get('/getById')
    async getStatucCode(ctx) {
        let id = ctx.params.id
        if (!id) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '缺少id'));
        }
        let result = await yapi.getInst(statusCodeModel).get(id);
        return (ctx.body = yapi.commons.resReturn(result));
    }

    @Post('/del')
    async statusCodeDel(ctx) {
        let id = ctx.params.id
        if (!id) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '缺少id'));
        }
        let result = await yapi.getInst(statusCodeModel).del(id);
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

module.exports = statusCodeController;