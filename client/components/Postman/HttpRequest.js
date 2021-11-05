import React, { PureComponent as Component } from 'react';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';

import Request from './Request/Request';
import Url from './Request/Url';

export default class HttpRequest extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{ height: '1000px', margin: '10px 0 0 0' }}>
                <ReflexContainer >
                    <ReflexElement size={40}>
                        <Url />
                    </ReflexElement>
                    <ReflexElement size={200}>
                        <Request></Request>
                    </ReflexElement>
                    <ReflexSplitter />
                    <ReflexElement size={300}>
                        xxx
                    </ReflexElement>
                </ReflexContainer>

            </div>
        )
    }
}