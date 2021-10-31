const baseController = require('./base.js');
const yapi = require('../yapi.js');
const statusCodeModel = require('../models/statusCode');
const statusCodeGroupModel = require('../models/statusCodeGroup');

class statusCodeController extends baseController {

    constructor(ctx) {
        super(ctx);
        this.Model = yapi.getInst(statusCodeModel);
        this.groupModel = yapi.getInst(statusCodeGroupModel);
    }


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
        if(params._id){
             result = await this.groupModel.update(params);
        }else{
             result = await this.groupModel.save(params);
        }


        return (ctx.body = yapi.commons.resReturn(result));
    }

    async groupDel(ctx) {
        let params = ctx.params;
        if (!params.groupId) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '缺少参数groupId'));
        }

        let result = await this.groupModel.del(params.groupId);
        return (ctx.body = yapi.commons.resReturn(result));
    }

    async groupList(ctx) {
        let params = ctx.params;
        if (!params.projectId) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '没有项目参数?'));
        }

        let datas = await this.groupModel.listByProject(params.projectId);

        return (ctx.body = yapi.commons.resReturn(datas));
    }

    async getGroup(ctx){
        const groupId = ctx.params.groupId;
        let data = await this.groupModel.get(groupId);
        return (ctx.body = yapi.commons.resReturn(data));
    }

    async statusCodeList(ctx) {
        let params = ctx.params;
        if (!params.groupId && !params.projectId) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '没有分组参数参数?'));
        }

        let datas = [];
        if (params.groupId) {
            datas = await this.Model.listByGroup(params.groupId);
        } else {
            datas = await this.Model.listByProject(params.projectId);
        }

        return (ctx.body = yapi.commons.resReturn(datas));
    }


    async statusCodeSave(ctx) {
        let params = ctx.params;

        if (!params.groupId) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '分组必填'));
        }

        if (!params.projectId) {
            return (ctx.body = yapi.commons.resReturn(null, 400, '所属项目必填'));
        }

        if (!params.parentId) {
            params.parentId = 0;
        }

        let result = await this.Model.save(params);

        return (ctx.body = yapi.commons.resReturn(result));
    }
}

module.exports = statusCodeController;