import React, { Component } from 'react';
import axios from 'axios';
import { Alert, message } from 'antd';

export default class Notify extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newVersion: process.env.version,
      version: process.env.version
    };
  }

  componentDidMount() {
    const versions = 'https://www.fastmock.site/mock/1529fa78fa4c4880ad153d115084a940/yapi/versions';
    axios.get(versions).then(req => {
      if (req.status === 200) {
        this.setState({ newVersion: req.data.data[0] });
      } else {
        message.error('无法获取新版本信息！');
      }
    });
  }

  render() {
    const isShow = true//this.state.newVersion !== this.state.version;
    return (
      <div>
        {isShow && (
          <Alert
          description={
              <div>
                YAPI 即将下线并关闭，相关文档不能编辑，请尽快迁移到eolinker来管理接口文档。
                &nbsp;&nbsp;&nbsp;
                <a
                  target="view_window"
                  href="https://kaishu.feishu.cn/wiki/wikcnFqf7WeXCQd8AwfYK7KTn0e"
                >
                  YAPI 迁移到 EOLINKER 说明文档
                </a>
              </div>
            }
            banner
            showIcon
            // closable
            type="error"
          />
        )}
      </div>
    );
  }
}
