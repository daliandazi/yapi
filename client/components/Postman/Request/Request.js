import React, { PureComponent as Component } from 'react';
import Headers from './Headers'
import Params from './Params';
import { Tabs } from 'antd'
const { TabPane } = Tabs


export default class Request extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Tabs size="small">
                    <TabPane tab="参数" key="params">
                        <Params key="params"></Params>
                    </TabPane>
                    <TabPane tab="请求头" key="headers">
                        <Headers></Headers>
                    </TabPane>
                    <TabPane tab="请求体" key="request_body">

                    </TabPane>
                </Tabs>

            </div>
        )
    }

}