import React, { PureComponent as Component } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';

import Request from './Request/Request';
import Url from './Request/Url';

export default class HttpRequest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...this.props.data,
        }
    }

    componentWillMount() {
        console.log(this.props.data)
    }

    send() {
        console.log(this.state)
    }

    render() {
        return (
            <div style={{ height: '1000px', margin: '10px 0 0 0' }}>
                <ReflexContainer >
                    <ReflexElement size={40}>
                        <Url method={this.state.method} path={this.state.path} onChange={({ method, path, environment }) => {
                            this.setState({
                                path: path,
                                method: method
                            })
                        }} onSend={() => {
                            this.send()
                        }} />
                    </ReflexElement>
                    <ReflexElement size={200}>
                        <Request onChange={({headers,params}) => {
                            console.log(params)
                        }}></Request>
                    </ReflexElement>
                    <ReflexSplitter />
                    <ReflexElement >
                        xxx
                    </ReflexElement>
                </ReflexContainer>

            </div>
        )
    }
}