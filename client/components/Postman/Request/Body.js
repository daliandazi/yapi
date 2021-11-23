import React, { PureComponent as Component } from 'react';
import { Tabs, Radio } from 'antd'
import './Body.scss'

export default class Body extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {
                bodyType: 'none'
            }

        }
    }

    valueChange(key, value) {
        let data = this.state.data;
        data[key] = value;
        this.setState({
            data: data
        })
    }

    render() {
        return (
            <div className="request-body-container">
                <div className="request-body-type">
                    <Radio.Group value={this.state.data.bodyType} onChange={(e) => {
                        this.valueChange('bodyType', e.target.value)
                    }}>
                        <Radio value='none'>none</Radio>
                        <Radio value='form-data'>form-data</Radio>
                        <Radio value='json'>JSON</Radio>
                    </Radio.Group>
                </div>
                {
                    this.state.data.bodyType === 'json' ? (
                        <div className='json-body'>
                            body
                        </div>
                    ) : (null)
                }
                <div>

                </div>

            </div>
        )
    }
}