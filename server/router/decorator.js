const path = require('path');
const Router = require('koa-router');
const glob = require('glob');

const symbolPrefix = Symbol('prefix');

//注解方法集合
const routerMap = new Map();
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
const loadRouter = conf => (target, name, descriptor) => {
  conf.path = formatPath(conf.path);
  routerMap.set(
    {
      target,
      ...conf,
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
  methods[key] = path => {
    return loadRouter({
      method: key.toLowerCase(),
      path,
    });
  };
});

//注解 Controller
const Controller = path => {
  return target => {
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

class Route {
  constructor(app, apiPath) {
    this.app = app;
    this.apiPath = apiPath;
    this.router = new Router();
  }

  init() {
    // 将 api 文件接口全部同步载入
    glob.sync(path.resolve(this.apiPath, './*.ts')).forEach(require);
    glob.sync(path.resolve(this.apiPath, './*.js')).forEach(file => {
      try {
        require(file);
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
      this.router[conf.method](routerPath, ...controllers);
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
};
