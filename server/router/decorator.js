const path = require('path');
const Router = require('koa-router');
const glob = require('glob');
const yapi = require('../yapi.js');
const symbolPrefix = Symbol('prefix');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.js');

//注解方法集合
const routerMap = new Map();
const controllerMap = new Map();
const isArray = obj => (Array.isArray(obj) ? obj : [obj]);
//注解方法集合
const methods = {
  Post: null,
  Get: null,
  Put: null,
  Del: null,
  All: null,
  Options: null,
  Head: null,
  Patch: null,
};

//格式化路径
const formatPath = path => {
  path = path.url || path;
  return path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
};

//注解方法汇总
const loadRouter = option => (target, name, descriptor) => {

  let path = null;
  let auth = true;

  if (typeof option.value == 'object') {
    path = option.value.path;
    auth = option.value.auth != null ? option.value.auth : true;
  } else if (typeof option.value == 'string') {
    path = option.value;
  }

  path = formatPath(path);
  let conf = {
    method: option.method,
    path: path
  }
  routerMap.set(
    {
      target,
      ...conf, name
    },
    target[name]
  );

  //如果是 / 路径
  if (conf.path === '/') {
    conf.path = '';
    routerMap.set(
      {
        target,
        ...conf,
      },
      target[name]
    );
  }
};

//注解方法加载
Object.keys(methods).forEach(key => {
  methods[key] = (value) => {
    return loadRouter({
      method: key.toLowerCase(),
      value
    });
  };
});

// Object.keys(methods).forEach(key => {
//   methods[key] = (config) => (target, name, descriptor) => {
//     // console.log(target)
//     // return (...args)=>{
//     //   console.log(args)
//     // }
//     let path = null;
//     let auth = true;

//     if (typeof config == 'object') {
//       path = config.path;
//       auth = config.auth != null ? config.auth : true;
//     } else if (typeof config == 'string') {
//       path = config;
//     }
//     return loadRouter({
//       method: key.toLowerCase(),
//       path: path,
//       auth: auth
//     });
//   };
// });

//注解 Controller
const Controller = path => {
  return (target) => {
    // console.log(target.name)
    controllerMap.set(path, target)
    target.prototype[symbolPrefix] = path;
  };
};

const Validate = (...mids) => {
  return (...args) => {
    const [target, name, descriptor] = args;
    target[name] = isArray(target[name]);
    target[name].unshift(...mids);
    return descriptor;
  };
};

const Auth = (...mids) => {
  return (...args) => {
    mids = mids || true
    const [target, name, descriptor] = args;
    return descriptor;
  }
};


class Route {
  constructor(app, apiPath) {
    this.app = app;
    this.apiPath = apiPath;
    this.router = new Router();
  }

  async checkLogin(ctx) {
    let token = ctx.cookies.get('_yapi_token');
    let uid = ctx.cookies.get('_yapi_uid');
    try {
      if (!token || !uid) {
        return false;
      }
      let userInst = yapi.getInst(userModel); //创建user实体
      let result = await userInst.findById(uid);
      if (!result) {
        return false;
      }

      let decoded;
      try {
        decoded = jwt.verify(token, result.passsalt);
      } catch (err) {
        return false;
      }

      if (decoded.uid == uid) {
        this.$uid = uid;
        this.$auth = true;
        this.$user = result;
        return true;
      }

      return false;
    } catch (e) {
      yapi.commons.log(e, 'error');
      return false;
    }
  }

  init() {
    // 将 api 文件接口全部同步载入
    glob.sync(path.resolve(this.apiPath, './*.ts')).forEach(require);
    glob.sync(path.resolve(this.apiPath, './*.js')).forEach(file => {
      try {
        let c = require(file);
      } catch (e) {
        console.log(e);
      }
    });
    for (let [conf, controller] of routerMap) {
      const controllers = isArray(controller);
      const prefixPath = conf.target[symbolPrefix]
        ? formatPath(conf.target[symbolPrefix])
        : '';
      const routerPath = prefixPath + conf.path;
      console.log(` add router: %s`, routerPath)

      // this.router[conf.method](routerPath, ...controllers);
      this.router[conf.method](routerPath, async ctx => {

        let auth = true;
        if (conf.auth === true) {
          auth = await this.checkLogin(ctx)
        }

        if (auth) {
          ctx.params = Object.assign({}, ctx.request.query, ctx.request.body, ctx.params);
          let cc = controllerMap.get(prefixPath)
          let c = new cc(ctx)
          try {
            c.init(ctx);
          } catch (e) {

          }
          await conf.target.init(ctx)
          try {
            await c[conf.name].call(c, ctx)
          } catch (e) {
            let body = yapi.commons.resReturn(null, 400, e);
            ctx.body = body;
          }

        } else {
          yapi.commons.log('token校验不通过', 'error');
          let body = yapi.commons.resReturn(null, 40011, '请登录...');
          ctx.body = body;
        }
      });
    }

    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());
  }
}

// 解构所有的注解方法
const { Post, Get, Put, Del, All, Options, Head, Patch } = methods;


module.exports = {
  Controller,
  Route,
  Post,
  Get,
  Put,
  Del,
  All,
  Options,
  Head,
  Patch,
  Validate,
  Auth
};
