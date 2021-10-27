const baseModel = require('./base.js');
const yapi = require("../yapi.js");

class statusCodeModel extends baseModel {
    getName() {
        return 'status_code';
    }

    getSchema() {
        return {
            code: {
                type: String,
                required: true
            },
            codeDescription: {
                type: String,
                required: true
            },
            projectId: {
                type: Number,
                required: true
            },
            groupId: {
                type: Number,
                required: true
            },
            index: {type: Number, default: 0},
            add_time: Number,
            up_time: Number
        };
    }

    save(data) {
        data.up_time = yapi.commons.time();
        data.add_time = yapi.commons.time();

        let m = new this.model(data);
        return m.save();
    }

    update(id, data) {
        data.up_time = yapi.commons.time();
        return this.model.update(
            {
                _id: id
            },
            data,
            {runValidators: true}
        );
    }

    /**
     * 删除
     * @param id
     * @returns {*}
     */
    del(id) {
        return this.model.remove({
            _id: id
        });
    }

    /**
     * 根据分组删除
     * @param groupId
     * @returns {*}
     */
    delByGroupId(groupId) {
        return this.model.remove({
            group_id: groupId
        });
    }

    get(id) {
        return this.model
            .findOne({
                _id: id
            })
            .exec();
    }

    listByGroup(groupId) {
        return this.model
            .find({
                groupId: groupId
            })
            .exec();
    }

    listByProject(projectId) {
        return this.model
            .find({
                projectId: projectId
            })
            .exec();
    }
}

module.exports = statusCodeModel;