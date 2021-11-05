import React, { PureComponent as Component } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import Checkbox from '@components/app/Checkbox/Checkbox.js'
import { Input, Button } from 'antd';
import './Params.scss'
export default class Params extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            parasms: [{
                name: "name",
                value: "",
                checked: true
            },{
                name: "name",
                value: "",
                checked: true
            },{
                name: "name",
                value: "",
                checked: true
            },{
                name: "name",
                value: "",
                checked: true
            },{
                name: "name",
                value: "",
                checked: true
            },{
                name: "name",
                value: "",
                checked: true
            },{
                name: "name",
                value: "",
                checked: true
            }]
        };
    }

    render() {
        const paramRender = (item, index) => {
            return (<div className="flex params" key={index}>
                <div className="flex flex-1 params-name">
                    <Input className="input" placeholder="Key" value={item.name} onChange={(event) => {
                        let value = event.target.value
                        let parasms = this.state.parasms;
                        let param = parasms[index];
                        param.name = value

                        this.setState({
                            parasms: parasms
                        }, () => {
                            console.log(this.state.parasms)
                        })
                    }} />
                </div>
                <div className="flex flex-1 params-value">
                    <Input className="input" placeholder="Value" />
                </div>
                <div className="flex params-checked">
                    <Checkbox checked={item.checked} onChange={(checked) => {

                        let parasms = this.state.parasms;
                        let param = parasms[index];
                        param.checked = checked

                        this.setState({
                            parasms: parasms
                        })
                    }}></Checkbox>
                </div>

            </div>)
        }
        return (
            <ReflexContainer style={{ padding: '10px 0px',overflowY:'auto' }}>
                {/* <ReflexElement resizeHeight={false}>
                    <Button onClick={() => {
                        let parasms = this.state.parasms;
                        parasms.push({
                            name: "",
                            checked: true
                        })

                        this.setState({
                            parasms: parasms
                        })
                    }}>ADD</Button>
                </ReflexElement> */}
                <ReflexElement size={200}>
                    {
                        this.state.parasms.map(paramRender)
                    }
                </ReflexElement>
            </ReflexContainer>
        )
    }

}