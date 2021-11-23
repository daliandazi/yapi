import React, { PureComponent as Component } from 'react';
import { Input, Select, Button } from 'antd'
const InputGroup = Input.Group;
const { Option } = Select;
import './Url.scss'

export default class Url extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                ...this.props,
            },
            methods: ['get', 'post', 'put', 'delete', 'head']
        }
    }
    componentWillMount() {
        console.log(this.state.path)
    }

    valueChange(key, value) {
        let data = this.state.data;
        data[key] = value;
        this.setState({
            data: data
        }, this.onChange)

    }

    send() {
        this.onChange()
        if (this.props.onSend) {
            this.props.onSend()
        }
    }

    onChange() {
        if (this.props.onChange) {
            this.props.onChange(this.state.data);
        }
    }

    render() {
        return (
            <div style={{ padding: '2px 10px', font: '12px', lineHeight: '12px' }} className="url-container flex flex-1">
                <div className="flex flex-1">
                    <div size="small" className="flex flex-1" style={{}}>
                        <Select defaultValue={this.state.data.method} onChange={(value) => {
                            this.valueChange('method', value)
                        }}>
                            {
                                this.state.methods.map(method => {
                                    return <Option key={method}>{method.toUpperCase()}</Option>
                                })
                            }
                        </Select>
                        <div className="flex flex-1" style={{ flex: ' 1 1 0%', flexDirection: 'column' }}>
                            <Input placeholder="Path" className="input" value={this.state.data.path} onChange={(e) => {
                                this.valueChange('path', e.target.value)
                            }} />
                        </div>
                    </div>
                </div>
                <div className="flex" style={{ margin: '0 4px' }}>
                    <Button onClick={()=>{
                        this.send()
                    }}>发送</Button>
                </div>

            </div>
        )
    }

}