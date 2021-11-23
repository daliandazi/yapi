import { MiddlewareParamArray } from './interface';

export interface RouterOption {
    // 路由
    path?: string | RegExp;
    // 请求类型
    requestMethod: string;
    // 路由别名
    routerName?: string;
    // 装饰器附加的方法
    method?: string;
    // 路由附加的中间件
    middleware?: MiddlewareParamArray;
    // 路由摘要
    summary?: string;
    // 路由描述
    description?: string;
}

export const RequestMethod = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete',
    PATCH: 'patch',
    ALL: 'all',
    OPTIONS: 'options',
    HEAD: 'head',
};

const defaultMetadata = {
    path: '/',
    requestMethod: RequestMethod.GET,
    routerName: null,
    middleware: [],
  };

export const RequestMapping = (
    metadata: RouterOption = defaultMetadata
  ): MethodDecorator => {
    const path = metadata.path || '/';
    const requestMethod = metadata.requestMethod || RequestMethod.GET;
    const routerName = metadata.routerName;
    const middleware = metadata.middleware;
  
    return (target, key, descriptor: PropertyDescriptor) => {
      attachClassMetadata(
        WEB_ROUTER_KEY,
        {
          path,
          requestMethod,
          routerName,
          method: key,
          middleware,
          summary: metadata?.summary || '',
          description: metadata?.description || '',
        } as RouterOption,
        target
      );
  
      return descriptor;
    };
  };

const createMappingDecorator =
  (method: string) =>
  (
    path?: string | RegExp,
    routerOptions: {
      routerName?: string;
      middleware?: MiddlewareParamArray;
      summary?: string;
      description?: string;
    } = { middleware: [] }
  ): MethodDecorator => {
    return RequestMapping(
      Object.assign(routerOptions, {
        requestMethod: method,
        path,
      })
    );
  };