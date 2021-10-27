const baseModel = require('./base.js');
const yapi = require("../yapi.js");

class statusCodeGroupModel extends baseModel {
    getName() {
        return 'status_code_group';
    }

    getSchema() {
        return {
            groupName: {
                type: String,
                required: true
            },
            projectId: {
                type: Number,
                required: true
            },
            parentId: {
                type: Number,
                required: true
            },
            index: {type: Number, default: 0},
            add_time: Number,
            up_time: Number
        };
    }

    save(data) {
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


    get(id) {
        return this.model
            .findOne({
                _id: id
            })
            .exec();
    }

    listByProject(projectId) {
        return this.model.find(
            {
                projectId: projectId
            }
        ).exec();
    }
}

module.exports = statusCodeGroupModel;