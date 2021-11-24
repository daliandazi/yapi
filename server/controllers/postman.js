const { Controller, Get, Post } = require('../router/decorator');
const axios = require('axios');
const yapi = require('../yapi.js');
const baseController = require('./base.js');
const { size } = require('underscore');

@Controller('/api/postman')
class CommonController extends baseController {
  constructor(ctx) {
    super(ctx);
  }
  @Post('/send')
  async test(ctx) {
    let body = ctx.request.body;
    let config = {
      url: body.url,
      method: body.method,
      headers: body.headers,
      timeout: body.timeout ? body.timeout : 10000,
      data:body.data,
    };



    const startTime = new Date();
    let response = await axios(config);
    const endTime = new Date();
    let time = endTime - startTime;
    // console.log(response);

    let size = yapi.commons.bytesToSize(JSON.stringify(response.data).length)

    return (ctx.body = yapi.commons.resReturn({
      body: response.data,
      status: response.status,
      headers: response.headers,
      time: time,
      size: size,
      statusText: response.statusText
    }));
  }
}
