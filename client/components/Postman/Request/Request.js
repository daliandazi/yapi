import React, { PureComponent as Component } from 'react';
import Headers from './Headers'
import Params from './Params';
import Body from './Body'
import { Tabs, Radio } from 'antd'
import './Request.scss'
const { TabPane } = Tabs


export default class Request extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            params: [],
            headers: []
        }
    }

    componentDidMount() {

    }


    valueChange(key, value) {
        let data = this.state || {};
        data[key] = value;
        this.setState({
            ...data
        }, () => {
            if (this.props.onChange) {
                this.props.onChange(this.state);
            }
        })
    }

    render() {
        return (
            <div>
                <Tabs size="small" animated={false}>
                    <TabPane tab={<div>Params<span className='request-badge'>{this.state.params.length}</span></div>} key="params">
                        <Params key="params" value={this.state.params} onChange={(data) => {
                            this.valueChange('params', data.values)
                        }}></Params>
                    </TabPane>
                    <TabPane tab={<div>Headers<span className='request-badge'>{this.state.headers.length}</span></div>} key="headers">
                        <Params key="headers" value={this.state.headers} onChange={(data) => {
                            this.valueChange('headers', data.values)
                        }}></Params>
                    </TabPane>
                    <TabPane tab="请求体" key="request_body">
                        <Body></Body>
                    </TabPane>
                </Tabs>

            </div>
        )
    }

}