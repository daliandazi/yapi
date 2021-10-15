import React, { PureComponent as Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Layout, Menu, Icon } from 'antd';
import { Route, Switch, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
const { Content, Sider } = Layout;

import '../interface.scss';

import InterfaceColMenu from './InterfaceColMenu.js';
import InterfaceColContent from './InterfaceColContent.js';
import InterfaceCaseContent from './InterfaceCaseContent.js';
import { getProject } from '../../../../reducer/modules/project';
import { setColData } from '../../../../reducer/modules/interfaceCol.js';

const contentRouter = {
    path: '/project/:id/interfaceCol/:action/:actionId',
    exact: true
};

const { SubMenu } = Menu;

const InterfaceColRoute = props => {
    console.log("----------")
    console.log(props.match.params.action)
    let C;
    if (props.match.params.action === 'col') {
        C = InterfaceColContent;
    } else if (props.match.params.action === 'case') {
        C = InterfaceCaseContent;
    } else {
        C = InterfaceCaseContent;
    }

    return <C {...props} />;
};

InterfaceColRoute.propTypes = {
    match: PropTypes.object
};

@connect(
    state => {
        return {
            isShowCol: state.interfaceCol.isShowCol
        };
    },
    {
        setColData,
        getProject
    }
)
class InterfaceCol extends Component {
    static propTypes = {
        match: PropTypes.object,
        history: PropTypes.object,
        location: PropTypes.object,
        isShowCol: PropTypes.bool,
        getProject: PropTypes.func,
        setColData: PropTypes.func
        // fetchInterfaceColList: PropTypes.func
    };

    constructor(props) {
        super(props);
        // this.state = {
        //   curkey: this.props.match.params.action === 'api' ? 'api' : 'colOrCase'
        // }
    }

    onChange = action => {
        let params = this.props.match.params;
        if (action === 'colOrCase') {
            action = this.props.isShowCol ? 'col' : 'case';
        }
        this.props.history.push('/project/' + params.id + '/interfaceCol/' + action);
    };
    async componentWillMount() {
        this.props.setColData({
            isShowCol: true
        });
        // await this.props.fetchInterfaceColList(this.props.match.params.id)
    }
    render() {
        const { action } = this.props.match.params;
        // const activeKey = this.state.curkey;
        const activeKey = action === 'api' ? 'api' : 'colOrCase';

        return (
            <Layout style={{ height: 'calc(100vh - 80px)' }}>
                <Sider style={{ height: '100%', overflow: 'hidden' }} width={300}>
                    <div className="left-menu">
                        <InterfaceColMenu
                            router={matchPath(this.props.location.pathname, contentRouter)}
                            projectId={this.props.match.params.id}
                        />
                    </div>
                </Sider>
                <Layout>
                    <Content
                        style={{
                            height: '100%',
                            margin: '0 24px 0 16px',
                            overflow: 'initial',
                            backgroundColor: '#fff'
                        }}
                    >
                        <div className="right-content">
                            <Switch>
                                <Route exact path="/project/:id/interfaceCol/:action" component={InterfaceColRoute} />
                                <Route {...contentRouter} component={InterfaceColRoute} />
                            </Switch>
                        </div>
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default InterfaceCol;
