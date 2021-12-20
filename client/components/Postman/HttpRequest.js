import React, { PureComponent as Component } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';

import Request from './Request/Request';
import Url from './Request/Url';

export default class HttpRequest extends Component {
    constructor(props) {
        super(props);
        this.state = {
            req_query: this.props.data.req_query,
            req_headers: this.props.data.req_headers,
            method: this.props.data.method,
            req_body_type: this.props.data.req_body_type,
            ...this.props.data,
        }
    }

    componentWillMount() {
        console.log(this.props.data)
    }

    send() {
        console.log(this.state.headers)
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
                        <Request params={this.state.req_query} headers={this.state.req_headers} onChange={({ headers, params }) => {
                            this.setState({ req_query: params, headers: headers })
                        }}></Request>
                    </ReflexElement>
                    <ReflexSplitter />
                    <ReflexElement >
                        {JSON.stringify(this.state.req_query)}
                    </ReflexElement>
                </ReflexContainer>

            </div>
        )
    }
}