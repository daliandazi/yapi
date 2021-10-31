const { Controller, Get, Post } = require('../router/decorator');
const axios = require('axios');
const yapi = require('../yapi.js');

@Controller('/api/postman')
class CommonController {
  @Post('/send')
  async test(ctx) {
    let body = ctx.request.body;
    let config = {
      url: body.url,
      method: body.method,
      headers: body.headers,
      timeout: body.timeout ? body.timeout : 10000,
    };

    let response = await axios(config);

    console.log(response);

    return (ctx.body = yapi.commons.resReturn({
      body: response.data,
      status: response.status,
      headers: response.headers,
      statusText:response.statusText
    }));
  }
}
