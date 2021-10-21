const axios = require('axios');

let config = {
    method: 'get',
    url: 'https://kaishu.yuque.com/api/v2/repos/789155/docs/uinysd?raw=1',
    headers: {
        'X-Auth-Token': 'kjarETPD4Nv1NIJRDtlokno6qaaXMyIZg9AOj1p8',
        'Cookie': '_yuque_session=TIkLqidn86fi06AORFkqXjKLMqbwD0Dd_mR8CF6Q0WLtZXEnc3J9seDPmdW1l3XRX2xW4uaYF43Vy332U7Kk5g==; ctoken=eRAw7SxGFV7E-RBUkqAPWTlQ; lang=zh-cn; yuque_ctoken=R7v3ozvqAb8PvJv14H_DUz2g; acw_tc=0a5510b616346980244106007e57183779e5977ff76ebe2f7da7c78fd2b367'
    }
};

axios(config)
    .then((response) => {
        console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
        console.log(error);
    });
