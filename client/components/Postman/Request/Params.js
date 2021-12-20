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
            params: this.props.value.length > 0 ? this.props.value : [{ enable: true }]
        })
    }

    changeValue(type, value, index) {
        let params = this.state.params;
        params[index] = params[index] || { name: "", value: '', desc: '', enable: true }
        let param = params[index];

        // 如果是最后一行，自动添加一行
        if (index >= params.length - 1 && (!this.stringNotBlank(param.name) || !this.stringNotBlank(param.value))) {
            params[index + 1] = {
                name: "", value: '', desc: '', enable: true
            }
        }
        param[type] = value;
        this.setState({
            params: params
        }, this.paramChangeEvent)
    }

    getValueData() {
        let params = this.state.params.filter((param) => {
            if (param.name && param.enable === true) {
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
                name: "", value: '', enable: true
            })
        } else if (params.length > 0) {
            let lastParam = params[params.length - 1];
            if ((!this.stringNotBlank(lastParam.name) || !this.stringNotBlank(lastParam.value))) {
                params.push({
                    name: "", value: '', enable: true
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
                    <Input className="input" placeholder="Key" value={item.name} onChange={(event) => {
                        let value = event.target.value
                        this.changeValue('name', value, index)
                    }} />
                </div>
                <div className="flex flex-1 params-value">
                    <Input className="input" placeholder="Value" value={item.value} onChange={(event) => {
                        let value = event.target.value
                        this.changeValue('value', value, index)
                    }} />
                </div>
                <div className="flex flex-1 params-value">
                    <Input className="input" placeholder="Descriotion" value={item.desc} onChange={(event) => {
                        let value = event.target.desc
                        this.changeValue('desc', value, index)
                    }} />
                </div>
                <div className="flex params-checked">
                    <Checkbox checked={item.enable} onChange={(enable) => {
                        this.changeValue('enable', enable, index)
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