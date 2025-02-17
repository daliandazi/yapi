const interfaceModel = require("../models/interface.js");
const interfaceCatModel = require("../models/interfaceCat.js");
const interfaceCaseModel = require("../models/interfaceCase.js");
const followModel = require("../models/follow.js");
const groupModel = require("../models/group.js");
const _ = require("underscore");
const url = require("url");
const baseController = require("./base.js");
const yapi = require("../yapi.js");
const userModel = require("../models/user.js");
const projectModel = require("../models/project.js");
const jsondiffpatch = require("jsondiffpatch");
const formattersHtml = jsondiffpatch.formatters.html;
const showDiffMsg = require("../../common/diff-view.js");
const mergeJsonSchema = require("../../common/mergeJsonSchema");
const { groupBy, isJson } = require("../utils/commons");
const fs = require("fs-extra");
const path = require("path");
const { Controller, Get, Post } = require('../router/decorator');
const schema = require('../../common/schema-transformTo-table.js');
const parsedJson = require('../../common/json5Comment');

// const annotatedCss = require("jsondiffpatch/public/formatters-styles/annotated.css");
// const htmlCss = require("jsondiffpatch/public/formatters-styles/html.css");

function handleHeaders(values) {
  let isfile = false,
    isHavaContentType = false;
  if (values.req_body_type === "form") {
    values.req_body_form.forEach((item) => {
      if (item.type === "file") {
        isfile = true;
      }
    });

    values.req_headers.map((item) => {
      if (item.name === "Content-Type") {
        item.value = isfile
          ? "multipart/form-data"
          : "application/x-www-form-urlencoded";
        isHavaContentType = true;
      }
    });
    if (isHavaContentType === false) {
      values.req_headers.unshift({
        name: "Content-Type",
        value: isfile
          ? "multipart/form-data"
          : "application/x-www-form-urlencoded",
      });
    }
  } else if (values.req_body_type === "json") {
    values.req_headers
      ? values.req_headers.map((item) => {
        if (item.name === "Content-Type") {
          item.value = "application/json";
          isHavaContentType = true;
        }
      })
      : [];
    if (isHavaContentType === false) {
      values.req_headers = values.req_headers || [];
      values.req_headers.unshift({
        name: "Content-Type",
        value: "application/json",
      });
    }
  }
}

@Controller("/api/interface")
class interfaceController extends baseController {
  constructor(ctx) {
    super(ctx);
    this.Model = yapi.getInst(interfaceModel);
    this.catModel = yapi.getInst(interfaceCatModel);
    this.projectModel = yapi.getInst(projectModel);
    this.caseModel = yapi.getInst(interfaceCaseModel);
    this.followModel = yapi.getInst(followModel);
    this.userModel = yapi.getInst(userModel);
    this.groupModel = yapi.getInst(groupModel);

    const minLengthStringField = {
      type: "string",
      minLength: 1,
    };

    const addAndUpCommonField = {
      desc: "string",
      status: "string",
      api_manager_conn_id: "number",
      req_query: [
        {
          name: "string",
          value: "string",
          example: "string",
          desc: "string",
          required: "string",
        },
      ],
      req_headers: [
        {
          name: "string",
          value: "string",
          example: "string",
          desc: "string",
          required: "string",
        },
      ],
      req_body_type: "string",
      req_params: [
        {
          name: "string",
          example: "string",
          desc: "string",
        },
      ],
      identityType: [],
      req_body_form: [
        {
          name: "string",
          type: {
            type: "string",
          },
          example: "string",
          desc: "string",
          required: "string",
        },
      ],
      req_body_other: "string",
      res_body_type: "string",
      res_body: "string",
      custom_field_value: "string",
      api_opened: "boolean",
      req_body_is_json_schema: "string",
      res_body_is_json_schema: "string",
      markdown: "string",
      ref_id: "number",
      type: {
        type: "string",
      },
    };

    this.schemaMap = {
      add: Object.assign(
        {
          project_id: "number",
          path: "string",
          title: "string",
          method: "string",
          catid: "number",
        },
        addAndUpCommonField
      ),
      up: Object.assign(
        {
          "*id": "number",
          project_id: "number",
          path: minLengthStringField,
          title: minLengthStringField,
          method: minLengthStringField,
          catid: "number",
          switch_notice: "boolean",
          message: minLengthStringField,
          tag: "array",
        },
        addAndUpCommonField
      ),
      save: Object.assign(
        {
          project_id: "number",
          catid: "number",
          title: minLengthStringField,
          path: minLengthStringField,
          method: minLengthStringField,
          message: minLengthStringField,
          dataSync: "string",
        },
        addAndUpCommonField
      ),
    };
  }

  /**
   * 添加接口
   * @interface /interface/add
   * @method POST
   * @category interface
   * @foldnumber 10
   * @param {Number}   project_id 项目id，不能为空
   * @param {String}   [title] 接口标题，不能为空
   * @param {String}   [path] 接口请求路径，不能为空
   * @param {String}   method 请求方式
   * @param {Array}  [req_headers] 请求的header信息
   * @param {String}  [req_headers[].name] 请求的header信息名
   * @param {String}  [req_headers[].value] 请求的header信息值
   * @param {Boolean}  [req_headers[].required] 是否是必须，默认为否
   * @param {String}  [req_headers[].desc] header描述
   * @param {String}  [req_body_type] 请求参数方式，有["form", "json", "text", "xml"]四种
   * @param {Array} [req_params] name, desc两个参数
   * @param {Mixed}  [req_body_form] 请求参数,如果请求方式是form，参数是Array数组，其他格式请求参数是字符串
   * @param {String} [req_body_form[].name] 请求参数名
   * @param {String} [req_body_form[].value] 请求参数值，可填写生成规则（mock）。如@email，随机生成一条email
   * @param {String} [req_body_form[].type] 请求参数类型，有["text", "file"]两种
   * @param {String} [req_body_other]  非form类型的请求参数可保存到此字段
   * @param {String}  [res_body_type] 相应信息的数据格式，有["json", "text", "xml"]三种
   * @param {String} [res_body] 响应信息，可填写任意字符串，如果res_body_type是json,则会调用mock功能
   * @param  {String} [desc] 接口描述
   * @returns {Object}
   * @example ./api/interface/add.json
   */
  async add(ctx) {
    let params = ctx.params;

    // 校验分类
    let cat = await this.catModel.get(params.catid);
    if (!cat) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "分类不存在"));
    }
    if (cat.project_id != params.project_id) {
      return (ctx.body = yapi.commons.resReturn(
        null,
        400,
        "接口和分类不在同一个项目下"
      ));
    }

    if (!this.$tokenAuth) {
      let auth = await this.checkAuth(params.project_id, "project", "edit");

      if (!auth) {
        return (ctx.body = yapi.commons.resReturn(null, 40033, "没有权限"));
      }
    }

    if (params.type && params.type == "ref") {
      if (!params.ref_id) {
        return (ctx.body = yapi.commons.resReturn(
          null,
          400,
          "缺少参数 ref_id"
        ));
      }
      // 判断是否已经存在
      const exist = await this.Model.existRef(params.project_id, params.ref_id);
      if (exist && exist > 0) {
        return (ctx.body = yapi.commons.resReturn(
          null,
          0,
          "接口已经存在"
        ));
      }
      let data = Object.assign(params, {
        uid: this.getUid(),
        add_time: yapi.commons.time(),
        up_time: yapi.commons.time(),
      });
      let result = await this.Model.save(data);

      return (ctx.body = yapi.commons.resReturn(result));
    }

    params.method = params.method || "GET";
    params.res_body_is_json_schema = _.isUndefined(
      params.res_body_is_json_schema
    )
      ? false
      : params.res_body_is_json_schema;
    params.req_body_is_json_schema = _.isUndefined(
      params.req_body_is_json_schema
    )
      ? false
      : params.req_body_is_json_schema;
    params.method = params.method.toUpperCase();
    params.req_params = params.req_params || [];
    params.res_body_type = params.res_body_type
      ? params.res_body_type.toLowerCase()
      : "json";
    let http_path = url.parse(params.path, true);

    if (!yapi.commons.verifyPath(http_path.pathname)) {
      return (ctx.body = yapi.commons.resReturn(
        null,
        400,
        "path第一位必需为 /, 只允许由 字母数字-/_:.! 组成"
      ));
    }

    handleHeaders(params);

    params.query_path = {};
    params.query_path.path = http_path.pathname;
    params.query_path.params = [];
    Object.keys(http_path.query).forEach((item) => {
      params.query_path.params.push({
        name: item,
        value: http_path.query[item],
      });
    });

    let checkRepeat = await this.Model.checkRepeat(
      params.project_id,
      params.path,
      params.method
    );

    if (checkRepeat > 0) {
      return (ctx.body = yapi.commons.resReturn(
        null,
        40022,
        "已存在的接口:" + params.path + "[" + params.method + "]"
      ));
    }

    let data = Object.assign(params, {
      uid: this.getUid(),
      add_time: yapi.commons.time(),
      up_time: yapi.commons.time(),
    });

    yapi.commons.handleVarPath(params.path, params.req_params);

    if (params.req_params.length > 0) {
      data.type = "var";
      data.req_params = params.req_params;
    } else {
      data.type = "static";
    }

    // 新建接口的人成为项目dev  如果不存在的话
    // 命令行导入时无法获知导入接口人的信息，其uid 为 999999
    let uid = this.getUid();

    if (this.getRole() !== "admin" && uid !== 999999) {
      let userdata = await yapi.commons.getUserdata(uid, "dev");
      // 检查一下是否有这个人
      let check = await this.projectModel.checkMemberRepeat(
        params.project_id,
        uid
      );
      if (check === 0 && userdata) {
        await this.projectModel.addMember(params.project_id, [userdata]);
      }
    }

    let result = await this.Model.save(data);

    yapi.emitHook("interface_add", result).then();
    this.catModel.get(params.catid).then((cate) => {
      let username = this.getUsername();
      let title = `<a href="/user/profile/${this.getUid()}">${username}</a> 为分类 <a href="/project/${params.project_id
        }/interface/api/cat_${params.catid}">${cate.name
        }</a> 添加了接口 <a href="/project/${params.project_id}/interface/api/${result._id
        }">${data.title}</a> `;

      yapi.commons.saveLog({
        content: title,
        type: "project",
        uid: this.getUid(),
        username: username,
        typeid: params.project_id,
      });
      this.projectModel
        .up(params.project_id, { up_time: new Date().getTime() })
        .then();
    });

    await this.autoAddTag(params);

    ctx.body = yapi.commons.resReturn(result);
  }

  /**
   * 保存接口数据，如果接口存在则更新数据，如果接口不存在则添加数据
   * @interface /interface/save
   * @method  post
   * @category interface
   * @foldnumber 10
   * @param {Number}   project_id 项目id，不能为空
   * @param {String}   title 接口标题，不能为空
   * @param {String}   path 接口请求路径，不能为空
   * @param {String}   method 请求方式
   * @param {Array}  [req_headers] 请求的header信息
   * @param {String}  [req_headers[].name] 请求的header信息名
   * @param {String}  [req_headers[].value] 请求的header信息值
   * @param {Boolean}  [req_headers[].required] 是否是必须，默认为否
   * @param {String}  [req_headers[].desc] header描述
   * @param {String}  [req_body_type] 请求参数方式，有["form", "json", "text", "xml"]四种
   * @param {Array} [req_params] name, desc两个参数
   * @param {Mixed}  [req_body_form] 请求参数,如果请求方式是form，参数是Array数组，其他格式请求参数是字符串
   * @param {String} [req_body_form[].name] 请求参数名
   * @param {String} [req_body_form[].value] 请求参数值，可填写生成规则（mock）。如@email，随机生成一条email
   * @param {String} [req_body_form[].type] 请求参数类型，有["text", "file"]两种
   * @param {String} [req_body_other]  非form类型的请求参数可保存到此字段
   * @param {String}  [res_body_type] 相应信息的数据格式，有["json", "text", "xml"]三种
   * @param {String} [res_body] 响应信息，可填写任意字符串，如果res_body_type是json,则会调用mock功能
   * @param  {String} [desc] 接口描述
   * @returns {Object}
   */

  async save(ctx) {
    let params = ctx.params;

    if (!this.$tokenAuth) {
      let auth = await this.checkAuth(params.project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = yapi.commons.resReturn(null, 40033, "没有权限"));
      }
    }
    params.method = params.method || "GET";
    params.method = params.method.toUpperCase();

    let http_path = url.parse(params.path, true);

    if (!yapi.commons.verifyPath(http_path.pathname)) {
      return (ctx.body = yapi.commons.resReturn(
        null,
        400,
        "path第一位必需为 /, 只允许由 字母数字-/_:.! 组成"
      ));
    }

    // 根据路径查找接口
    let result = await this.Model.getByPath(
      params.project_id,
      params.path,
      params.method,
      "_id res_body"
    );

    if (result.length > 0) {
      // 修改
      result.forEach(async (item) => {
        params.id = item._id;
        // console.log(this.schemaMap['up'])
        let validParams = Object.assign({}, params);
        let validResult = yapi.commons.validateParams(
          this.schemaMap["up"],
          validParams
        );
        if (validResult.valid) {
          let data = {};
          data.params = validParams;

          if (params.res_body_is_json_schema && params.dataSync === "good") {
            try {
              let new_res_body = yapi.commons.json_parse(params.res_body);
              let old_res_body = yapi.commons.json_parse(item.res_body);
              data.params.res_body = JSON.stringify(
                mergeJsonSchema(old_res_body, new_res_body),
                null,
                2
              );
            } catch (err) { }
          }
          await this.up(data);
        } else {
          return (ctx.body = yapi.commons.resReturn(
            null,
            400,
            validResult.message
          ));
        }
      });
    } else {
      // 新增
      let validResult = yapi.commons.validateParams(
        this.schemaMap["add"],
        params
      );
      if (validResult.valid) {
        let data = {};
        data.params = params;
        await this.add(data);
      } else {
        return (ctx.body = yapi.commons.resReturn(
          null,
          400,
          validResult.message
        ));
      }
    }
    ctx.body = yapi.commons.resReturn(result);
    // return ctx.body = yapi.commons.resReturn(null, 400, 'path第一位必需为 /, 只允许由 字母数字-/_:.! 组成');
  }

  async autoAddTag(params) {
    //检查是否提交了目前不存在的tag
    let tags = params.tag;
    if (tags && Array.isArray(tags) && tags.length > 0) {
      let projectData = await this.projectModel.get(params.project_id);
      let tagsInProject = projectData.tag;
      let needUpdate = false;
      if (tagsInProject && Array.isArray(tagsInProject) && tagsInProject.length > 0) {
        tags.forEach(tag => {
          if (!_.find(tagsInProject, item => {
            return item.name === tag;
          })) {//tag不存在
            needUpdate = true;
            tagsInProject.push({
              name: tag,
              desc: tag
            });
          }
        });
      } else {
        needUpdate = true
        tagsInProject = []
        tags.forEach(tag => {
          tagsInProject.push({
            name: tag,
            desc: tag
          });
        });
      }
      if (needUpdate) {//需要更新tag
        let data = {
          tag: tagsInProject,
          up_time: yapi.commons.time()
        };
        await this.projectModel.up(params.project_id, data);
      }
    }
  }

  /**
   * 获取项目分组
   * @interface /interface/get
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {Number}   id 接口id，不能为空
   * @returns {Object}
   * @example ./api/interface/get.json
   */
  async get(ctx) {
    let params = ctx.params;
    if (!params.id) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "接口id不能为空"));
    }

    try {
      let result = await this.Model.get(params.id);

      if (!result) {
        return (ctx.body = yapi.commons.resReturn(null, 490, "接口不存在的"));
      }

      if (result && result.ref_id) {
        let ref = await this.Model.get(result.ref_id);
        let refObj = {
          project_id: ref.project_id,
          id:ref._id
        };
        let data = Object.assign(ref, {
          catid: result.catid,
          project_id: result.project_id,
          type: result.type,
          _id: result._id,
        });

        result = data.toObject();
        result.ref = refObj;
      } else {
        result = result.toObject();
      }
      if (this.$tokenAuth) {
        if (params.project_id !== result.project_id) {
          ctx.body = yapi.commons.resReturn(null, 400, "token有误");
          return;
        }
      }

      let createUserinfo = await this.userModel.findById(result.uid);
      if (createUserinfo) {
        result.username = createUserinfo.username;
      }
      if (result.api_manager_conn_id) {
        let connUserinfo = await this.userModel.findById(result.api_manager_conn_id);
        if (connUserinfo) {
          result.connUsername = connUserinfo.username;
        }
      } else {
        result.connUsername = result.username
      }
      let project = await this.projectModel.getBaseInfo(result.project_id);
      let authTimeStart = new Date().getTime();
      if (project.project_type === "private") {
        if ((await this.checkAuth(project._id, "project", "view")) !== true) {
          return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
        }
      }
      let authTime = new Date().getTime() - authTimeStart;

      // yapi.emitHook('interface_get', result).then();
      // result = result.toObject();
      if (result.res_body_type === 'json' && result.res_body != null && result.res_body.length > 2 && isJson(result.res_body)) {
        try {
          let res_body_json = schema.schemaTransformToTable(JSON.parse(result.res_body));
          res_body_json = parsedJson(res_body_json);
          result.res_body_json = res_body_json;
        } catch (e) {
          console.error(e)
        }
      }

      if (result.req_body_type === 'json' && result.req_body_other && isJson(result.req_body_other)) {
        try {
          let req_body_other_json = schema.schemaTransformToTable(JSON.parse(result.req_body_other));
          req_body_other_json = parsedJson(req_body_other_json);
          result.req_body_other_json = req_body_other_json;
        } catch (e) {
          console.error(e)
        }
      }

      ctx.body = yapi.commons.resReturn(result);
      ctx.set("Server-Timing", " authTime;dur=" + authTime);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  /**
   * 清洗数据
   * @param {} ctx 
   */
  @Get("/clean")
  async cleanData(ctx) {
    let project_id = ctx.params.projectId;
    if (project_id == null) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "项目id不能为空"));
    }

    // 1 清洗关联数据
    let allInterface = await this.Model.list(project_id);
    for (let i in allInterface) {
      let interfaceData = allInterface[i];
      interfaceData = interfaceData.toObject();
      if (interfaceData.ref_id) {
        let ref = await this.Model.get(interfaceData.ref_id);
        if (!ref) {
          console.log(`已经不存在接口: %s`, interfaceData);
          await this.Model.del(interfaceData._id)
        } else {
          // if (interfaceData.path != ref.path) {
          interfaceData.path = ref.path;
          interfaceData.title = ref.title;
          interfaceData.method = ref.method;
          await this.Model.up(interfaceData._id, interfaceData);
          // }
        }
      }
    }
    console.log('清理完成')
    ctx.body = yapi.commons.resReturn({ msg: "成功" });

  }

  /**
   * 接口列表
   * @interface /interface/list
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {Number}   project_id 项目id，不能为空
   * @param {Number}   page 当前页
   * @param {Number}   limit 每一页限制条数
   * @returns {Object}
   * @example ./api/interface/list.json
   */
  @Get("/list")
  async list(ctx) {
    let project_id = ctx.params.project_id;
    let page = ctx.request.query.page || 1,
      limit = ctx.request.query.limit || 10;
    let project = await this.projectModel.getBaseInfo(project_id);
    if (!project) {
      return (ctx.body = yapi.commons.resReturn(null, 407, "不存在的项目"));
    }
    if (project.project_type === "private") {
      if ((await this.checkAuth(project._id, "project", "view")) !== true) {
        return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
      }
    }
    if (!project_id) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "项目id不能为空"));
    }

    try {
      let result;
      if (limit === "all") {
        result = await this.Model.list(project_id);
      } else {
        result = await this.Model.listWithPage(project_id, page, limit);
      }

      let datas = [];
      if (result) {
        for (let i in result) {
          let api = result[i];
          api = api.toObject()
          if (api.ref_id) {
            let ref = await this.Model.get(api.ref_id);
            if (ref) {
              ref = ref.toObject()
              let data = Object.assign(ref, {
                ref_id: api.ref_id,
                res_body: "",
                req_query: "",
                catid: api.catid,
                project_id: api.project_id,
                type: api.type,
                _id: api._id,
                desc: null,
                req_headers: null,
                markdown: null
              });
              datas.push(data);
            }
          } else {
            datas.push(api);
          }
        }
      }

      let managerIds = datas.filter(a => a.api_manager_conn_id).map(a => a.api_manager_conn_id)

      let managers = await this.userModel.findByUids(managerIds);

      let managerMap = {};
      managers.forEach(m => {
        managerMap[m._id] = m.username;
      })

      await datas.forEach(a => {
        if (a.api_manager_conn_id) {
          let username = managerMap[a.api_manager_conn_id] || "";
          a.connUsername = username;
        }
      })

      let count = await this.Model.listCount({ project_id });

      ctx.body = yapi.commons.resReturn({
        count: count,
        total: Math.ceil(count / limit),
        list: datas,
      });
      yapi.emitHook("interface_list", result).then();
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 402, err.message);
    }
  }

  /**
   * 我负责的和创建的接口
   * @param {}} ctx 
   */
  @Get('/my')
  async myInterfaceList(ctx) {
    let uid = this.getUid();
    let { page, limit, path } = ctx.params;
    page = page || 1;
    limit = limit || 10;
    let interfaces = await this.Model.myInterfaces(path, uid, page, limit);

    let data = [];
    interfaces.forEach(api => {
      data.push(api.toObject())
    })

    if (interfaces) {
      let uids = [];
      interfaces.forEach(api => {
        uids.push(api.uid)
        if (api.api_manager_conn_id) {
          uids.push(api.api_manager_conn_id)
        }
      })
      uids = Array.from(new Set(uids))
      try {
        let users = await this.userModel.findByUids(uids);
        let userMap = {};
        users.forEach(m => {
          userMap[m._id] = m.username;
        })
        data.forEach(api => {
          if (api.uid) {
            let userName = userMap[api.uid];
            api.createUserName = userName
          }
          if (api.api_manager_conn_id) {
            let userName = userMap[api.api_manager_conn_id];
            api.connUsername = userName;
          }
        })
      } catch (e) {
        console.log(e)
      }
    }
    let interfaceCount = await this.Model.myInterfacesCount(path, uid);
    ctx.body = yapi.commons.resReturn({
      list: data,
      total: Math.ceil(interfaceCount / limit),
      count: interfaceCount,
      page: page,
      limit: limit
    })
  }

  async findByProjects(ctx) {
    let projectIds = ctx.params.projectIds;
    if (!projectIds) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "项目id不能为空"));
    }

    let projects = await this.projectModel.findListBaseInfo(projectIds);
    if (!projects) {
      return (ctx.body = yapi.commons.resReturn(null, 407, "不存在的项目"));
    }

    try {
      let result = await this.Model.findListByProjects(projectIds);

      let interfaces = {};
      if (result) {
        for (let i in result) {
          let api = result[i];
          let data = api || {};
          if (api.ref_id) {
            let ref = await this.Model.get(api.ref_id);
            if (ref) {
              data = Object.assign(ref, {
                ref_id: api.ref_id,
                res_body: "",
                req_query: "",
                catid: api.catid,
                project_id: api.project_id,
                type: api.type,
                _id: api._id,
              });
            }
          }
          interfaces[data.project_id] = interfaces[data.project_id] || [];
          interfaces[data.project_id].push(data);
        }
      }

      ctx.body = yapi.commons.resReturn({
        interfaces: interfaces,
        projects: projects
      });
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 402, err.message);
    }
  }

  async downloadCrx(ctx) {
    let filename = "crossRequest.zip";
    let dataBuffer = yapi.fs.readFileSync(
      yapi.path.join(yapi.WEBROOT, "static/attachment/cross-request.zip")
    );
    ctx.set("Content-disposition", "attachment; filename=" + filename);
    ctx.set("Content-Type", "application/zip");
    ctx.body = dataBuffer;
  }

  /**
   * 根据分组查询api列表
   * /interface/list_cat
   * @param {*} ctx
   * @returns
   */
  async listByCat(ctx) {
    let catid = ctx.request.query.catid;
    let page = ctx.request.query.page || 1,
      limit = ctx.request.query.limit || 10;

    if (!catid) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "catid不能为空"));
    }
    try {
      let catdata = await this.catModel.get(catid);

      let project = await this.projectModel.getBaseInfo(catdata.project_id);
      if (project.project_type === "private") {
        if ((await this.checkAuth(project._id, "project", "view")) !== true) {
          return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
        }
      }

      let result = await this.Model.listByCatidWithPage(catid, page, limit);

      let datas = [];
      if (result) {
        for (let i in result) {
          let api = result[i];
          api = api.toObject();
          if (api.ref_id) {
            let ref = await this.Model.get(api.ref_id);
            if (ref) {
              ref = ref.toObject();
              let data = Object.assign(ref, {
                ref_id: api.ref_id,
                res_body: "",
                req_query: "",
                catid: api.catid,
                project_id: api.project_id,
                type: api.type,
                _id: api._id,
                desc: null,
                req_headers: null,
                markdown: null
              });
              datas.push(data);
            }
          } else {
            datas.push(api);
          }
        }
      }


      if (datas) {
        let uids = [];
        datas.forEach(api => {
          uids.push(api.uid)
          if (api.api_manager_conn_id) {
            uids.push(api.api_manager_conn_id)
          }
        })
        uids = Array.from(new Set(uids))
        try {
          let users = await this.userModel.findByUids(uids);
          let userMap = {};
          users.forEach(m => {
            userMap[m._id] = m.username;
          })
          datas.forEach(api => {
            if (api.uid) {
              let userName = userMap[api.uid];
              api.createUserName = userName
            }
            if (api.api_manager_conn_id) {
              let userName = userMap[api.api_manager_conn_id];
              api.connUsername = userName;
            }
          })
        } catch (e) {
          console.log(e)
        }
      }

      // let managerIds = datas.filter(a => a.api_manager_conn_id).map(a => a.api_manager_conn_id)

      // let managers = await this.userModel.findByUids(managerIds);

      // let managerMap = {};
      // managers.forEach(m => {
      //   managerMap[m._id] = m.username;
      // })

      // datas.forEach(a => {
      //   if (a.api_manager_conn_id) {
      //     let username = managerMap[a.api_manager_conn_id] || "";
      //     a.createUserName = username;
      //   }
      // })

      let count = await this.Model.listCount({ catid });

      ctx.body = yapi.commons.resReturn({
        count: count,
        total: Math.ceil(count / limit),
        list: datas,
      });
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 402, err.message + "1");
    }
  }

  /**
   * interface/list_menu
   * @param {*} ctx
   * @returns
   */
  async listByMenu(ctx) {
    let project_id = ctx.params.project_id;
    if (!project_id) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "项目id不能为空"));
    }

    let project = await this.projectModel.getBaseInfo(project_id);
    if (!project) {
      return (ctx.body = yapi.commons.resReturn(null, 406, "不存在的项目"));
    }
    if (project.project_type === "private") {
      if ((await this.checkAuth(project._id, "project", "view")) !== true) {
        return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
      }
    }

    try {
      let result = await this.catModel.list(project_id);
      let newResult = yapi.commons.translateDataToTree(result);

      let islist =
        ctx.params.islist && ctx.params.islist === "1" ? true : false;
      // let newResult = await this.getCat(project_id, islist);
      ctx.body = yapi.commons.resReturn(newResult);
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 402, err.message);
    }
  }

  async getCat(project_id, islist, mycatid) {
    let result = await this.catModel.list(project_id),
      newResult = [];

    // 循环查询分组和接口列表，比较慢
    // for (let i = 0, item, list; i < result.length; i++) {
    //   item = result[i].toObject();
    //   // 根据分类查询接口列表
    //   list = await this.Model.listByCatid(item._id);
    //   for (let j = 0; j < list.length; j++) {
    //     list[j] = list[j].toObject();
    //   }
    //   item.list = list;
    //   newResult[i] = item;

    // }

    let allInterface = await this.Model.listByPid(project_id);
    let datas = [];
    if (allInterface) {
      for (let i in allInterface) {
        let api = allInterface[i];
        if (api.ref_id) {
          let ref = await this.Model.get(api.ref_id);
          if (ref) {
            let data = Object.assign(ref, {
              res_body: "",
              req_query: "",
              catid: api.catid,
              index: api.index,
              project_id: api.project_id,
              type: api.type,
              _id: api._id,
            });
            datas.push(data);
          }
        } else {
          datas.push(api);
        }
      }
    }
    const gr = groupBy(datas, "catid");

    for (let i = 0, item, list; i < result.length; i++) {
      item = result[i].toObject();
      // 根据分类查询接口列表
      list = gr[item._id];
      if (!list) {
        list = [];
      }
      if (list) {
        for (let j = 0; j < list.length; j++) {
          list[j] = list[j].toObject();
        }
      }

      item.list = list;
      newResult[i] = item;
    }

    newResult = islist
      ? newResult
      : yapi.commons.translateDataToTree(newResult, mycatid);
    return newResult;
  }

  /**
   * 编辑接口
   * @interface /interface/up
   * @method POST
   * @category interface
   * @foldnumber 10
   * @param {Number}   id 接口id，不能为空
   * @param {String}   [path] 接口请求路径
   * @param {String}   [method] 请求方式
   * @param {Array}  [req_headers] 请求的header信息
   * @param {String}  [req_headers[].name] 请求的header信息名
   * @param {String}  [req_headers[].value] 请求的header信息值
   * @param {Boolean}  [req_headers[].required] 是否是必须，默认为否
   * @param {String}  [req_headers[].desc] header描述
   * @param {String}  [req_body_type] 请求参数方式，有["form", "json", "text", "xml"]四种
   * @param {Mixed}  [req_body_form] 请求参数,如果请求方式是form，参数是Array数组，其他格式请求参数是字符串
   * @param {String} [req_body_form[].name] 请求参数名
   * @param {String} [req_body_form[].value] 请求参数值，可填写生成规则（mock）。如@email，随机生成一条email
   * @param {String} [req_body_form[].type] 请求参数类型，有["text", "file"]两种
   * @param {String} [req_body_other]  非form类型的请求参数可保存到此字段
   * @param {String}  [res_body_type] 相应信息的数据格式，有["json", "text", "xml"]三种
   * @param {String} [res_body] 响应信息，可填写任意字符串，如果res_body_type是json,则会调用mock功能
   * @param  {String} [desc] 接口描述
   * @returns {Object}
   * @example ./api/interface/up.json
   */

  async up(ctx) {
    let params = ctx.params;

    if (!_.isUndefined(params.method)) {
      params.method = params.method || "GET";
      params.method = params.method.toUpperCase();
    }

    let id = params.id;
    params.message = params.message || "";
    params.message = params.message.replace(/\n/g, "<br>");
    // params.res_body_is_json_schema = _.isUndefined (params.res_body_is_json_schema) ? true : params.res_body_is_json_schema;
    // params.req_body_is_json_schema = _.isUndefined(params.req_body_is_json_schema) ?  true : params.req_body_is_json_schema;

    handleHeaders(params);

    let interfaceData = await this.Model.get(id);
    if (!interfaceData) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "不存在的接口"));
    }
    if (!this.$tokenAuth) {
      let auth = await this.checkAuth(
        interfaceData.project_id,
        "project",
        "edit"
      );
      if (!auth) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
      }
    }

    let data = Object.assign(
      {
        up_time: yapi.commons.time(),
      },
      params
    );

    if (params.path) {
      let http_path;
      http_path = url.parse(params.path, true);

      if (!yapi.commons.verifyPath(http_path.pathname)) {
        return (ctx.body = yapi.commons.resReturn(
          null,
          400,
          "path第一位必需为 /, 只允许由 字母数字-/_:.! 组成"
        ));
      }
      params.query_path = {};
      params.query_path.path = http_path.pathname;
      params.query_path.params = [];
      Object.keys(http_path.query).forEach((item) => {
        params.query_path.params.push({
          name: item,
          value: http_path.query[item],
        });
      });
      data.query_path = params.query_path;
    }

    if (
      params.path &&
      (params.path !== interfaceData.path ||
        params.method !== interfaceData.method)
    ) {
      let checkRepeat = await this.Model.checkRepeat(
        interfaceData.project_id,
        params.path,
        params.method
      );
      if (checkRepeat > 0) {
        return (ctx.body = yapi.commons.resReturn(
          null,
          401,
          "已存在的接口:" + params.path + "[" + params.method + "]"
        ));
      }
    }

    if (!_.isUndefined(data.req_params)) {
      if (Array.isArray(data.req_params) && data.req_params.length > 0) {
        data.type = "var";
      } else {
        data.type = "static";
        data.req_params = [];
      }
    }
    let result = await this.Model.up(id, data);
    let username = this.getUsername();
    let CurrentInterfaceData = await this.Model.get(id);
    let logData = {
      interface_id: id,
      cat_id: data.catid,
      current: CurrentInterfaceData.toObject(),
      old: interfaceData.toObject(),
    };

    this.catModel.get(interfaceData.catid).then((cate) => {
      let diffView2 = showDiffMsg(jsondiffpatch, formattersHtml, logData);
      if (diffView2.length <= 0) {
        return; // 没有变化时，不写日志
      }
      yapi.commons.saveLog({
        content: `<a href="/user/profile/${this.getUid()}">${username}</a> 
                    更新了分类 <a href="/project/${cate.project_id
          }/interface/api/cat_${data.catid}">${cate.name}</a> 
                    下的接口 <a href="/project/${cate.project_id
          }/interface/api/${id}">${interfaceData.title}</a><p>${params.message
          }</p>`,
        type: "project",
        uid: this.getUid(),
        username: username,
        typeid: cate.project_id,
        data: logData,
      });
    });

    this.projectModel
      .up(interfaceData.project_id, { up_time: new Date().getTime() })
      .then();
    if (params.switch_notice === true) {
      let diffView = showDiffMsg(jsondiffpatch, formattersHtml, logData);
      let annotatedCss = fs.readFileSync(
        path.resolve(
          yapi.WEBROOT,
          "node_modules/jsondiffpatch/dist/formatters-styles/annotated.css"
        ),
        "utf8"
      );
      let htmlCss = fs.readFileSync(
        path.resolve(
          yapi.WEBROOT,
          "node_modules/jsondiffpatch/dist/formatters-styles/html.css"
        ),
        "utf8"
      );

      let project = await this.projectModel.getBaseInfo(
        interfaceData.project_id
      );

      let interfaceUrl = `${ctx.request.origin}/project/${interfaceData.project_id}/interface/api/${id}`;

      yapi.commons.sendNotice(interfaceData.project_id, {
        title: `${username} 更新了接口`,
        content: `<html>
        <head>
        <style>
        ${annotatedCss}
        ${htmlCss}
        </style>
        </head>
        <body>
        <div><h3>${username}更新了接口(${data.title})</h3>
        <p>项目名：${project.name} </p>
        <p>修改用户: ${username}</p>
        <p>接口名: <a href="${interfaceUrl}">${data.title}</a></p>
        <p>接口路径: [${data.method}]${data.path}</p>
        <p>详细改动日志: ${this.diffHTML(diffView)}</p></div>
        </body>
        </html>`,
      });
    }

    yapi.emitHook('interface_update', id).then();
    await this.autoAddTag(params);
    try {
      this.refreshRef(id);
    } catch (e) {
      yapi.commons.log(e, "error")
    }

    ctx.body = yapi.commons.resReturn(result);
    return 1;
  }

  /**
   * 刷新关联的数据
   * @param {}} id 
   */
  async refreshRef(id) {
    const source = await this.Model.get(id);
    // 1 清洗关联数据
    let refInterfaceData = await this.Model.listByRefId(id);
    for (let i in refInterfaceData) {
      let interfaceData = refInterfaceData[i];
      interfaceData = interfaceData.toObject();
      if (interfaceData.ref_id && source._id == interfaceData.ref_id) {
        interfaceData.path = source.path;
        interfaceData.title = source.title;
        interfaceData.method = source.method;
        await this.Model.up(interfaceData._id, interfaceData);
      }
    }
  }

  diffHTML(html) {
    if (html.length === 0) {
      return `<span style="color: #555">没有改动，该操作未改动Api数据</span>`;
    }

    return html.map((item) => {
      return `<div>
      <h4 class="title">${item.title}</h4>
      <div>${item.content}</div>
    </div>`;
    });
  }

  /**
   * 删除接口
   * @interface /interface/del
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {Number}   id 接口id，不能为空
   * @returns {Object}
   * @example ./api/interface/del.json
   */

  async del(ctx) {
    try {
      let id = ctx.request.body.id;

      if (!id) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "接口id不能为空"));
      }

      let data = await this.Model.get(id);

      if (data.uid != this.getUid()) {
        let auth = await this.checkAuth(data.project_id, "project", "danger");
        if (!auth) {
          return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
        }
      }

      // let inter = await this.Model.get(id);
      let result = await this.Model.del(id);
      yapi.emitHook("interface_del", id).then();
      await this.caseModel.delByInterfaceId(id);
      let username = this.getUsername();
      this.catModel.get(data.catid).then((cate) => {
        yapi.commons.saveLog({
          content: `<a href="/user/profile/${this.getUid()}">${username}</a> 删除了分类 <a href="/project/${cate.project_id
            }/interface/api/cat_${data.catid}">${cate.name}</a> 下的接口 "${data.title
            }"`,
          type: "project",
          uid: this.getUid(),
          username: username,
          typeid: cate.project_id,
        });
      });
      this.projectModel
        .up(data.project_id, { up_time: new Date().getTime() })
        .then();
      ctx.body = yapi.commons.resReturn(result);
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 402, err.message);
    }
  }

  // 处理编辑冲突
  async solveConflict(ctx) {
    try {
      let id = parseInt(ctx.query.id, 10),
        result,
        userInst,
        userinfo,
        data;
      if (!id) {
        return ctx.websocket.send("id 参数有误");
      }
      result = await this.Model.get(id);

      if (result && result.ref_id) {
        let ref = await this.Model.get(result.ref_id);
        let data = Object.assign(ref, {
          type: result.type,
          catid: result.catid,
          project_id: result.project_id,
          type: result.type,
          _id: result._id,
        });
        result = data;
      }

      if (result.edit_uid !== 0 && result.edit_uid !== this.getUid()) {
        userInst = yapi.getInst(userModel);
        userinfo = await userInst.findById(result.edit_uid);
        data = {
          errno: result.edit_uid,
          data: { uid: result.edit_uid, username: userinfo.username },
        };
      } else {
        this.Model.upEditUid(id, this.getUid()).then();
        data = {
          errno: 0,
          data: result,
        };
      }
      ctx.websocket.send(JSON.stringify(data));
      ctx.websocket.on("close", () => {
        this.Model.upEditUid(id, 0).then();
      });
    } catch (err) {
      yapi.commons.log(err, "error");
    }
  }

  async addCat(ctx) {
    try {
      let params = ctx.request.body;
      params = yapi.commons.handleParams(params, {
        name: "string",
        project_id: "number",
        desc: "string",
      });

      if (!params.project_id) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "项目id不能为空"));
      }
      if (!this.$tokenAuth) {
        let auth = await this.checkAuth(params.project_id, "project", "edit");
        if (!auth) {
          return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
        }
      }

      if (!params.name) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "名称不能为空"));
      }

      let result = await this.catModel.save({
        name: params.name,
        project_id: params.project_id,
        desc: params.desc,
        parent_id: params.parent_id || -1,
        uid: this.getUid(),
        add_time: yapi.commons.time(),
        up_time: yapi.commons.time(),
      });

      let username = this.getUsername();
      yapi.commons.saveLog({
        content: `<a href="/user/profile/${this.getUid()}">${username}</a> 添加了分类  <a href="/project/${params.project_id
          }/interface/api/cat_${result._id}">${params.name}</a>`,
        type: "project",
        uid: this.getUid(),
        username: username,
        typeid: params.project_id,
      });

      ctx.body = yapi.commons.resReturn(result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 402, e.message);
    }
  }

  async upCat(ctx) {
    try {
      let params = ctx.request.body;

      let username = this.getUsername();
      let cate = await this.catModel.get(params.catid);

      let auth = await this.checkAuth(cate.project_id, "project", "edit");
      if (!auth) {
        return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
      }

      let result = await this.catModel.up(params.catid, {
        name: params.name,
        desc: params.desc,
        up_time: yapi.commons.time(),
      });

      yapi.commons.saveLog({
        content: `<a href="/user/profile/${this.getUid()}">${username}</a> 更新了分类 <a href="/project/${cate.project_id
          }/interface/api/cat_${params.catid}">${cate.name}</a>`,
        type: "project",
        uid: this.getUid(),
        username: username,
        typeid: cate.project_id,
      });

      ctx.body = yapi.commons.resReturn(result);
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 400, e.message);
    }
  }

  async delCat(ctx) {
    try {
      let id = ctx.request.body.catid;
      let catData = await this.catModel.get(id);
      if (!catData) {
        ctx.body = yapi.commons.resReturn(null, 400, "不存在的分类");
      }

      if (catData.uid !== this.getUid()) {
        let auth = await this.checkAuth(
          catData.project_id,
          "project",
          "danger"
        );
        if (!auth) {
          return (ctx.body = yapi.commons.resReturn(null, 400, "没有权限"));
        }
      }

      let username = this.getUsername();
      yapi.commons.saveLog({
        content: `<a href="/user/profile/${this.getUid()}">${username}</a> 删除了分类 "${catData.name
          }" 及该分类下的接口`,
        type: "project",
        uid: this.getUid(),
        username: username,
        typeid: catData.project_id,
      });

      // 删除下面所有子分类和接口
      let cattreenode = await this.getCat(catData.project_id, false, id);

      let delcattree = async (catdata) => {
        let interfaceData = catdata.list;
        if (catdata.children && catdata.children.length > 0) {
          catdata.children.forEach((subcat) => {
            delcattree(subcat);
          });
        }
        interfaceData.forEach(async (item) => {
          try {
            yapi.emitHook("interface_del", item._id).then();
            await this.caseModel.delByInterfaceId(item._id);
          } catch (e) {
            yapi.commons.log(e.message, "error");
          }
        });
        await this.catModel.del(catdata._id);
        let r = await this.Model.delByCatid(catdata._id);
        return r;
      };
      let r = delcattree(cattreenode);
      return (ctx.body = yapi.commons.resReturn(r));
    } catch (e) {
      yapi.commons.resReturn(null, 400, e.message);
    }
  }

  /**
   * 获取分类列表
   * @interface /interface/getCatMenu
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {Number}   project_id 项目id，不能为空
   * @returns {Object}
   * @example ./api/interface/getCatMenu
   */

  async getCatMenu(ctx) {
    let project_id = ctx.params.project_id;

    if (!project_id || isNaN(project_id)) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "项目id不能为空"));
    }

    try {
      let project = await this.projectModel.getBaseInfo(project_id);
      if (project.project_type === "private") {
        if ((await this.checkAuth(project._id, "project", "edit")) !== true) {
          return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
        }
      }
      let res = await this.catModel.list(project_id);
      return (ctx.body = yapi.commons.resReturn(res));
    } catch (e) {
      yapi.commons.resReturn(null, 400, e.message);
    }
  }

  /**
   * 获取自定义接口字段数据
   * @interface /interface/get_custom_field
   * @method GET
   * @category interface
   * @foldnumber 10
   * @param {String}   app_code = '111'
   * @returns {Object}
   *
   */
  async getCustomField(ctx) {
    let params = ctx.request.query;

    if (Object.keys(params).length !== 1) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "参数数量错误"));
    }
    let customFieldName = Object.keys(params)[0];
    let customFieldValue = params[customFieldName];

    try {
      //  查找有customFieldName的分组（group）
      let groups = await this.groupModel.getcustomFieldName(customFieldName);
      if (groups.length === 0) {
        return (ctx.body = yapi.commons.resReturn(
          null,
          404,
          "没有找到对应自定义接口"
        ));
      }

      // 在每个分组（group）下查找对应project的id值
      let interfaces = [];
      for (let i = 0; i < groups.length; i++) {
        let projects = await this.projectModel.list(groups[i]._id);

        // 在每个项目（project）中查找interface下的custom_field_value
        for (let j = 0; j < projects.length; j++) {
          let data = {};
          let inter = await this.Model.getcustomFieldValue(
            projects[j]._id,
            customFieldValue
          );
          if (inter.length > 0) {
            data.project_name = projects[j].name;
            data.project_id = projects[j]._id;
            inter = inter.map((item, i) => {
              item = inter[i] = inter[i].toObject();
              item.res_body = yapi.commons.json_parse(item.res_body);
              item.req_body_other = yapi.commons.json_parse(
                item.req_body_other
              );

              return item;
            });

            data.list = inter;
            interfaces.push(data);
          }
        }
      }
      return (ctx.body = yapi.commons.resReturn(interfaces));
    } catch (e) {
      yapi.commons.resReturn(null, 400, e.message);
    }
  }

  requiredSort(params) {
    return params.sort((item1, item2) => {
      return item2.required - item1.required;
    });
  }

  /**
   * 更新多个接口case index
   * @interface /interface/up_index
   * @method POST
   * @category col
   * @foldnumber 10
   * @param {Array}  [id, index]
   * @returns {Object}
   * @example
   */

  async upIndex(ctx) {
    try {
      let params = ctx.request.body;
      if (!params || !Array.isArray(params)) {
        ctx.body = yapi.commons.resReturn(null, 400, "请求参数必须是数组");
      }
      params.forEach((item) => {
        if (item.id) {
          this.Model.upIndex(item.id, item.index).then(
            (res) => { },
            (err) => {
              yapi.commons.log(err.message, "error");
            }
          );
        }
      });

      return (ctx.body = yapi.commons.resReturn("成功！"));
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 400, e.message);
    }
  }

  /**
   * 更新多个接口cat index
   * @interface /interface/up_cat_index
   * @method POST
   * @category col
   * @foldnumber 10
   * @param {Array}  [id, index]
   * @returns {Object}
   * @example
   */

  async upCatIndex(ctx) {
    try {
      let params = ctx.request.body;
      if (!params || !Array.isArray(params)) {
        ctx.body = yapi.commons.resReturn(null, 400, "请求参数必须是数组");
      }
      params.forEach((item) => {
        if (item.id) {
          this.catModel.upCatIndex(item.id, item.index).then(
            (res) => { },
            (err) => {
              yapi.commons.log(err.message, "error");
            }
          );
        }
      });

      return (ctx.body = yapi.commons.resReturn("成功！"));
    } catch (e) {
      ctx.body = yapi.commons.resReturn(null, 400, e.message);
    }
  }

  async schema2json(ctx) {
    let schema = ctx.request.body.schema;
    let required = ctx.request.body.required;

    let res = yapi.commons.schemaToJson(schema, {
      alwaysFakeOptionals: _.isUndefined(required) ? true : require,
    });
    // console.log('res',res)
    return (ctx.body = res);
  }

  // 获取开放接口数据
  async listByOpen(ctx) {
    let project_id = ctx.request.query.project_id;

    if (!project_id) {
      return (ctx.body = yapi.commons.resReturn(null, 400, "项目id不能为空"));
    }

    let project = await this.projectModel.getBaseInfo(project_id);
    if (!project) {
      return (ctx.body = yapi.commons.resReturn(null, 406, "不存在的项目"));
    }
    if (project.project_type === "private") {
      if ((await this.checkAuth(project._id, "project", "view")) !== true) {
        return (ctx.body = yapi.commons.resReturn(null, 406, "没有权限"));
      }
    }

    let basepath = project.basepath;
    try {
      let result = await this.catModel.list(project_id),
        newResult = [];

      for (let i = 0, item, list; i < result.length; i++) {
        item = result[i].toObject();
        list = await this.Model.listByInterStatus(item._id, "open");
        for (let j = 0; j < list.length; j++) {
          list[j] = list[j].toObject();
          list[j].basepath = basepath;
        }

        newResult = [].concat(newResult, list);
      }

      ctx.body = yapi.commons.resReturn(newResult);
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 402, err.message);
    }
  }

  async dingTalkView(id) {
    let result = await yapi.getInst(interfaceModel).get(id);
    return result;
  }
}

module.exports = interfaceController;
