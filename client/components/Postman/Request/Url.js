import React, { PureComponent as Component } from 'react';
import { Input, Select, Button } from 'antd'
const InputGroup = Input.Group;
const { Option } = Select;
import './Url.scss'

export default class Url extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{ padding: '2px 10px', font: '12px', lineHeight: '12px' }} className="url-container flex flex-1">
                <div className="flex flex-1">
                    <div size="small" className="flex flex-1" style={{}}>
                        <Select>
                            <Option key="get">GET</Option>
                            <Option key="POST">POST</Option>
                        </Select>
                        <div className="flex flex-1" style={{ flex: ' 1 1 0%', flexDirection: 'column' }}>
                            <Input className="input" style={{  }} />
                        </div>
                    </div>
                </div>
                <div className="flex" style={{ margin: '0 4px' }}>
                    <Button >发送</Button>
                </div>

            </div>
        )
    }

}