import React, { PureComponent as Component } from 'react';
import PropTypes from 'prop-types';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import Checkbox from '@components/app/Checkbox/Checkbox.js'
import { Input, Icon } from 'antd';
import './Params.scss'
import Trash from '@svg/trash.svg'

export default class Params extends React.Component {
    static propTypes = {
        onChange: PropTypes.func,
        value: PropTypes.array
    }
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            params: []
        };
    }
    componentDidMount() {
        this.setState({
            params: this.props.value.length > 0 ? this.props.value : [{checked:true}]
        })
    }

    changeValue(type, value, index) {
        let params = this.state.params;
        params[index] = params[index] || { key: "", value: '', checked: true }
        let param = params[index];

        // 如果是最后一行，自动添加一行
        if (index >= params.length - 1 && (!this.stringNotBlank(param.key) || !this.stringNotBlank(param.value))) {
            params[index + 1] = {
                key: "", value: '', checked: true
            }
        }
        param[type] = value;
        this.setState({
            params: params
        }, this.paramChangeEvent)
    }

    getValueData() {
        let params = this.state.params.filter((param) => {
            if (param.key && param.checked === true) {
                return true
            }
            return false;
        });
        return params;
    }
    removeParam(index) {
        let params = this.state.params;
        params.splice(index, 1);
        this.setState({
            params: params
        }, this.paramChangeEvent)
    }

    paramChangeEvent() {
        let params = this.state.params || [];
        if (params.length <= 0) {
            params.push({
                key: "", value: '', checked: true
            })
        } else if (params.length > 0) {
            let lastParam = params[params.length - 1];
            if ((!this.stringNotBlank(lastParam.key) || !this.stringNotBlank(lastParam.value))) {
                params.push({
                    key: "", value: '', checked: true
                })
            }
        }
        this.setState({
            params: params
        }, () => {
            if (this.props.onChange) {
                let values = this.getValueData();
                this.props.onChange({
                    values: values,
                    count: values.length
                });
            }
        })
    }


    stringNotBlank(str) {
        if (str && str.length > 0) {
            return false;
        }
        return true;
    }

    render() {
        const paramRender = (item, index) => {
            return (<div className="flex params" key={index}>
                <div className="flex flex-1 params-name">
                    <Input className="input" placeholder="Key" value={item.key} onChange={(event) => {
                        let value = event.target.value
                        this.changeValue('key', value, index)
                    }} />
                </div>
                <div className="flex flex-1 params-value">
                    <Input className="input" placeholder="Value" onChange={(event) => {
                        let value = event.target.value
                        this.changeValue('value', value, index)
                    }} />
                </div>
                <div className="flex params-checked">
                    <Checkbox checked={item.checked} onChange={(checked) => {
                        this.changeValue('checked', checked, index)
                    }}></Checkbox>
                </div>
                <div className="flex params-trash">
                    <div style={{ height: '20px', padding: '2px', marginTop: '3px' }}><Icon onClick={() => {
                        this.removeParam(index)
                    }}
                        component={() => <Trash color="#EF4444" width="16" height='16' />}
                    ></Icon></div>
                </div>

            </div>)
        }
        return (
            <ReflexContainer style={{ padding: '10px 0px', overflowY: 'auto' }}>
                <ReflexElement size={200}>
                    <div className='params-container'>
                        {
                            this.state.params.map(paramRender)
                        }
                    </div>
                </ReflexElement>
            </ReflexContainer>
        )
    }

}