import React, { PureComponent as Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Tabs, Layout, Menu, Icon, Button } from 'antd';
import { Route, Switch, Redirect, matchPath } from 'react-router-dom';
import { Subnav } from '@components/index';
import { fetchGroupMsg } from '@reducer/modules/group';
import { setBreadcrumb } from '@reducer/modules/user';
import { getProject } from '@reducer/modules/project';
import Interface from './Interface/Interface.js';
import Activity from './Activity/Activity.js';
import Setting from './Setting/Setting.js';
import Loading from '@components/Loading/Loading';
import ProjectMember from './Setting/ProjectMember/ProjectMember.js';
import ProjectData from './Setting/ProjectData/ProjectData.js';
import InterfaceCol from './Interface/InterfaceCol/InterfaceCol.js';
import StatusCode from './StatusCode/StatusCode';
import DataStructure from './DataStructure/DataStructure.js';

import Lake from './Lake/Lake';

const plugin = require('client/plugin.js');

const { Content, Sider } = Layout;

const headHeight = 80;

@connect(
  state => {
    return {
      curProject: state.project.currProject,
      currGroup: state.group.currGroup,
    };
  },
  {
    getProject,
    fetchGroupMsg,
    setBreadcrumb,
  }
)
export default class Project extends Component {
  static propTypes = {
    match: PropTypes.object,
    curProject: PropTypes.object,
    getProject: PropTypes.func,
    location: PropTypes.object,
    fetchGroupMsg: PropTypes.func,
    setBreadcrumb: PropTypes.func,
    currGroup: PropTypes.object,
  };
  state = {
    collapsed: false,
    project: null,
  };

  constructor(props) {
    super(props);
  }

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  async componentWillMount() {
    let project = (await this.props.getProject(this.props.match.params.id))
      .payload.data.data;
    await this.props.fetchGroupMsg(this.props.curProject.group_id);
    // console.log(project.payload.data.data)
    this.setState({
      project: project,
    });
    this.props.setBreadcrumb([
      {
        name: this.props.currGroup.group_name,
        href: '/space/group/' + this.props.currGroup._id,
      },
      {
        name: this.props.curProject.name,
      },
    ]);
  }

  async componentWillReceiveProps(nextProps) {
    const currProjectId = this.props.match.params.id;
    const nextProjectId = nextProps.match.params.id;
    if (currProjectId !== nextProjectId) {
      await this.props.getProject(nextProjectId);
      await this.props.fetchGroupMsg(this.props.curProject.group_id);
      this.props.setBreadcrumb([
        {
          name: this.props.currGroup.group_name,
          href: '/space/group/' + this.props.currGroup._id,
        },
        {
          name: this.props.curProject.name,
        },
      ]);
    }
  }

  render() {
    const { match, location } = this.props;
    let routers = {
      interface: {
        name: 'API',
        icon: 'api',
        path: '/project/:id/interface/api',
        component: Interface,
        count: 0,
      },
      interfaceCol: {
        name: 'API测试',
        icon: 'car',
        path: '/project/:id/interfaceCol',
        component: InterfaceCol,
      },
      statusCode: {
        name: '状态码',
        icon: 'car',
        path: '/project/:id/statusCode',
        component: StatusCode,
      },
      dataStructure: {
        name: '模板',
        icon: 'database',
        path: '/project/:projectId/dataStructure',
        component: DataStructure,
      },
      // lake: { name: '语雀文档', icon: 'car', path: '/project/:id/lake', component: Lake },
      activity: {
        name: '动态',
        icon: 'eye',
        path: '/project/:id/activity',
        component: Activity,
      },
      data: {
        name: '数据管理',
        icon: 'database',
        path: '/project/:id/data',
        component: ProjectData,
      },
      members: {
        name: '成员管理',
        icon: 'user',
        path: '/project/:id/members',
        component: ProjectMember,
      },
      setting: {
        name: '设置',
        icon: 'setting',
        path: '/project/:id/setting',
        component: Setting,
      },
    };

    plugin.emitHook('sub_nav', routers);

    let key, defaultName;
    for (key in routers) {
      if (
        matchPath(location.pathname, {
          path: routers[key].path,
        }) !== null
      ) {
        defaultName = routers[key].name;
        break;
      }
    }

    let subnavData = [];
    Object.keys(routers).forEach(key => {
      let item = routers[key];
      let value = {};
      if (key === 'interface') {
        value = {
          name: item.name,
          path: `/project/${match.params.id}/interface/api`,
          icon: item.icon,
          count:
            this.state.project != null ? this.state.project.interface_count : 0,
        };
      } if (key === 'dataStructure') {
        value = {
          name: item.name,
          path: item.path.replace(/\:projectId/gi, match.params.id),
          icon: item.icon,
        };
      } else {
        value = {
          name: item.name,
          path: item.path.replace(/\:id/gi, match.params.id),
          icon: item.icon,
        };
      }
      subnavData.push(value);
    });

    if (this.props.currGroup.type === 'private') {
      subnavData = subnavData.filter(item => {
        return item.name != '成员管理';
      });
    }

    if (Object.keys(this.props.curProject).length === 0) {
      return <Loading visible />;
    }

    return (
      <div>
        <Layout style={{ height: 'calc(100vh - 60px)', marginLeft: '2px' }}>
          <Sider
            style={{
              borderRight: '1px solid #E4E6E9',
              backgroundColor: '#F7F7F7',
            }}
            width={160}
            trigger={null}
            collapsible
            collapsed={this.state.collapsed}
          >
            {/* <div style={{height:'32px',padding:'4px 10px',marginTop:'2px',borderBottom:'1px dashed #EEEEEE'}}>
              <Icon type={this.state.collapsed ? 'arrow-right' : 'arrow-left'} onClick={this.toggleCollapsed}/>
            </div> */}
            <Subnav
              inlineCollapsed={this.state.collapsed}
              default={defaultName}
              data={subnavData}
            />
            <div
              style={{
                width: '4px',
                height: '100%',
                position: 'absolute',
                right: 0,
                top: 0,
                textAlign: 'center',
                alignItems: 'center',
                display: 'flex',
              }}
            >
              <Icon
                type={this.state.collapsed ? 'right' : 'left'}
                style={{ marginLeft: '3px' }}
                onClick={this.toggleCollapsed}
              />
            </div>
          </Sider>
          <Content style={{ overflow: 'hidden', padding: '10px' }}>
            <Switch>
              <Redirect
                exact
                from="/project/:id"
                to={`/project/${match.params.id}/interface/api`}
              />
              {Object.keys(routers).map(key => {
                let item = routers[key];

                return key === 'members' ? (
                  this.props.currGroup.type !== 'private' ? (
                    <Route
                      path={item.path}
                      component={item.component}
                      key={key}
                    />
                  ) : null
                ) : (
                  <Route
                    path={item.path}
                    component={item.component}
                    key={key}
                  />
                );
              })}
            </Switch>
          </Content>
        </Layout>
      </div>
    );
  }
}
