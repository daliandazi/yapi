const { string } = require("prop-types");
const yapi = require("../yapi.js");
const baseModel = require("./base.js");

class interfaceModel extends baseModel {
  getName() {
    return "interface";
  }

  getSchema() {
    return {
      title: { type: String, required: false },
      uid: { type: Number, required: true },
      path: { type: String, required: false },
      method: { type: String, required: false },
      project_id: { type: Number, required: true },
      catid: { type: Number, required: true },
      edit_uid: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ["undone", "done", "invalid"],
        default: "undone",
      },
      desc: String,
      api_manager_conn_id: {
        type: Number,
      },
      markdown: String,
      add_time: Number,
      up_time: Number,
      identityType: { type: Array, required: false },
      type: { type: String, enum: ["static", "var", "ref"], default: "static" },
      ref_id: { type: Number },
      query_path: {
        path: String,
        params: [
          {
            name: String,
            value: String,
          },
        ],
      },
      req_query: [
        {
          name: String,
          value: String,
          example: String,
          desc: String,
          required: {
            type: String,
            enum: ["1", "0"],
            default: "1",
          },
        },
      ],
      req_headers: [
        {
          name: String,
          value: String,
          example: String,
          desc: String,
          required: {
            type: String,
            enum: ["1", "0"],
            default: "1",
          },
        },
      ],
      req_params: [
        {
          name: String,
          desc: String,
          example: String,
        },
      ],
      req_body_type: {
        type: String,
        enum: ["form", "json", "text", "file", "raw"],
      },
      req_body_is_json_schema: { type: Boolean, default: false },
      req_body_form: [
        {
          name: String,
          type: { type: String, enum: ["text", "file"] },
          example: String,
          value: String,
          desc: String,
          required: {
            type: String,
            enum: ["1", "0"],
            default: "1",
          },
        },
      ],
      req_body_other: String,
      res_body_type: {
        type: String,
        enum: ["json", "text", "xml", "raw", "json-schema"],
      },
      res_body: String,
      res_body_is_json_schema: { type: Boolean, default: false },
      custom_field_value: String,
      field2: String,
      field3: String,
      api_opened: { type: Boolean, default: false },
      index: { type: Number, default: 0 },
      tag: Array,
    };
  }

  save(data) {
    let m = new this.model(data);
    return m.save();
  }

  get(id) {
    return this.model
      .findOne({
        _id: id,
      })
      .exec();
  }

  getBaseinfo(id) {
    return this.model
      .findOne({
        _id: id,
      })
      .select("path method uid title project_id cat_id status ")
      .exec();
  }

  getVar(project_id, method) {
    return this.model
      .find({
        project_id: project_id,
        type: "var",
        method: method,
      })
      .select("_id path")
      .exec();
  }

  getByQueryPath(project_id, path, method) {
    return this.model
      .find({
        project_id: project_id,
        "query_path.path": path,
        method: method,
      })
      .exec();
  }

  getByPath(project_id, path, method, select) {
    select =
      select ||
      "_id title uid path method project_id catid edit_uid status ref_id add_time up_time type query_path req_query req_headers req_params req_body_type req_body_form req_body_other res_body_type custom_field_value res_body res_body_is_json_schema req_body_is_json_schema";
    return this.model
      .find({
        project_id: project_id,
        path: path,
        method: method,
      })
      .select(select)
      .exec();
  }

  checkRepeat(id, path, method) {
    return this.model.countDocuments({
      project_id: id,
      path: path,
      method: method,
    });
  }

  countByProjectId(id) {
    return this.model.countDocuments({
      project_id: id,
    });
  }

  list(project_id, select) {
    select =
      select ||
      "_id title uid path method project_id catid edit_uid status add_time up_time ref_id type";
    return this.model
      .find({
        project_id: project_id,
      })
      .select(select)
      .sort({ title: 1 })
      .exec();
  }

  findListByProjects(projectIds, select) {
    select =
      select ||
      "_id title uid path method project_id catid edit_uid status add_time up_time ref_id type";
    return this.model
      .find({
        project_id: projectIds,
      })
      .select(select)
      .sort({ title: 1 })
      .exec();
  }

  listWithPage(project_id, page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);
    return this.model
      .find({
        project_id: project_id,
      })
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        "_id title uid path method project_id catid api_opened edit_uid status add_time up_time tag ref_id type"
      )
      .exec();
  }

  listByPid(project_id, select) {
    select =
      select ||
      "_id title uid path method project_id catid edit_uid status add_time up_time index tag ref_id type";
    return this.model
      .find({
        project_id: project_id,
      })
      .select(select)
      .sort({ title: 1 })
      .exec();
  }

  //获取全部接口信息
  getInterfaceListCount() {
    return this.model.countDocuments({});
  }

  listByCatid(catid, select) {
    select =
      select ||
      "_id title uid path method project_id catid edit_uid status add_time up_time index tag";
    return this.model
      .find({
        catid: catid,
      })
      .select(select)
      .sort({ index: 1 })
      .exec();
  }

  listByCatidWithPage(catid, page, limit) {
    page = parseInt(page);
    limit = parseInt(limit);
    return this.model
      .find({
        catid: catid,
      })
      .sort({ index: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        "_id title uid api_manager_conn_id path method project_id catid edit_uid api_opened status add_time , up_time , type, index, tag, type, ref_id"
      )
      .exec();
  }

  listByInterStatus(catid, status) {
    let option = {};
    if (status === "open") {
      option = {
        catid: catid,
        api_opened: true,
      };
    } else {
      option = {
        catid: catid,
      };
    }
    return this.model.find(option).select().sort({ title: 1 }).exec();
  }

  del(id) {
    return this.model.remove({
      _id: id,
    });
  }

  delByCatid(id) {
    return this.model.remove({
      catid: id,
    });
  }

  delByProjectId(id) {
    return this.model.remove({
      project_id: id,
    });
  }

  up(id, data) {
    data.up_time = yapi.commons.time();
    return this.model.update(
      {
        _id: id,
      },
      data,
      { runValidators: true }
    );
  }

  upEditUid(id, uid) {
    return this.model.update(
      {
        _id: id,
      },
      { edit_uid: uid },
      { runValidators: true }
    );
  }

  getcustomFieldValue(id, value) {
    return this.model
      .find({
        project_id: id,
        custom_field_value: value,
      })
      .select(
        "title uid path method edit_uid status desc add_time up_time type query_path req_query req_headers req_params req_body_type req_body_form req_body_other res_body_type custom_field_value"
      )
      .exec();
  }

  /**
   * 项目下是否已经存在关联接口
   * @param {*} project_id 
   * @param {*} ref_id 
   * @returns 
   */
  existRef(project_id, ref_id) {
    return this.model
      .count({
        project_id: project_id,
        ref_id: ref_id,
      });
  }
  listCount(option) {
    return this.model.countDocuments(option);
  }

  upIndex(id, index) {
    return this.model.update(
      {
        _id: id,
      },
      {
        index: index,
      }
    );
  }

  myInterfaces(path, uid, page, limit) {
    let query = {};
    query["$or"] = [
      { uid: uid },
      { api_manager_conn_id: uid }
    ];
    query["ref_id"] = { $exists: false }
    if (path && path.trim().length > 0) {
      query["path"] = new RegExp(path, "ig")
    }

    return this.model
      .find(query).sort({ up_time: -1 }).skip((page - 1) * limit).limit(limit)
      .select(
        "title uid api_manager_conn_id path method project_id edit_uid status desc add_time up_time type query_path "
      )
  }

  myInterfacesCount(path, uid) {
    let query = {};
    query["$or"] = [
      { uid: uid },
      { api_manager_conn_id: uid }
    ];
    query["ref_id"] = { $exists: false }
    if (path && path.trim().length > 0) {
      query["path"] = new RegExp(path, "ig")
    }

    return this.model
      .count(query)
  }

  search(keyword, page, limit) {
    return this.model
      .find({
        $or: [
          { 'title': new RegExp(keyword, "ig") },
          { 'path': new RegExp(keyword, "ig") }
        ]
      }).sort({ up_time: -1 }).skip((page - 1) * limit).limit(limit).select("title path uid method add_time up_time project_id")
  }

  searchCount(keyword) {
    return this.model
      .count({
        $or: [
          { 'title': new RegExp(keyword, "ig") },
          { 'path': new RegExp(keyword, "ig") }
        ]
      });

  }
}

module.exports = interfaceModel;
