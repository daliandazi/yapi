const axios = require('axios');
const baseController = require('./base.js');
const yapi = require('../yapi.js');

let baseUrl = "https://kaishu.yuque.com/api/v2";

class yuqueController extends baseController {

    constructor(ctx) {
        super(ctx);
    }

    async getDoc(ctx) {
        let slug = ctx.request.query.slug;
        let namespace = ctx.request.query.namespace;

        let config = {
            method: 'get',
            url: baseUrl + '/repos/789155/docs/' + slug + '?raw=1',
            headers: {
                'User-Agent': 'ks',
                'X-Auth-Token': 'kjarETPD4Nv1NIJRDtlokno6qaaXMyIZg9AOj1p8',
                'Cookie': '_yuque_session=TIkLqidn86fi06AORFkqXjKLMqbwD0Dd_mR8CF6Q0WLtZXEnc3J9seDPmdW1l3XRX2xW4uaYF43Vy332U7Kk5g==; ctoken=eRAw7SxGFV7E-RBUkqAPWTlQ; lang=zh-cn; yuque_ctoken=R7v3ozvqAb8PvJv14H_DUz2g; acw_tc=0a5510b616346980244106007e57183779e5977ff76ebe2f7da7c78fd2b367'
            }
        };

        let response = await axios(config);

        ctx.body = yapi.commons.resReturn(response.data.data);

    }

    async getDocsByNamespace(ctx) {
        let namespace = ctx.request.query.namespace;

        let config = {
            method: 'get',
            url: baseUrl + '/repos/789155/docs',
            headers: {
                'User-Agent': 'ks',
                'X-Auth-Token': 'kjarETPD4Nv1NIJRDtlokno6qaaXMyIZg9AOj1p8',
                'Cookie': '_yuque_session=TIkLqidn86fi06AORFkqXjKLMqbwD0Dd_mR8CF6Q0WLtZXEnc3J9seDPmdW1l3XRX2xW4uaYF43Vy332U7Kk5g==; ctoken=eRAw7SxGFV7E-RBUkqAPWTlQ; lang=zh-cn; yuque_ctoken=R7v3ozvqAb8PvJv14H_DUz2g; acw_tc=0a5510b616346980244106007e57183779e5977ff76ebe2f7da7c78fd2b367'
            }
        };

        let response = await axios(config);

        ctx.body = yapi.commons.resReturn(response.data.data);

    }

}

module.exports = yuqueController