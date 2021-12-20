import React, { PureComponent as Component } from 'react';
import GroupList from './GroupList/GroupList.js';
import ProjectList from './ProjectList/ProjectList.js';
import MemberList from './MemberList/MemberList.js';
import GroupLog from './GroupLog/GroupLog.js';
import GroupSetting from './GroupSetting/GroupSetting.js';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Tabs, Layout, Spin } from 'antd';
const { Content, Sider } = Layout;
const TabPane = Tabs.TabPane;
import { fetchNewsData } from '../../reducer/modules/news.js';
import {
  setCurrGroup
} from '../../reducer/modules/group';
import './Group.scss';
import axios from 'axios'
import Home from './Home/Home';
import Project from './ProjectList/index.js';

@connect(
  state => {
    return {
      curGroupId: state.group.currGroup._id,
      curUserRole: state.user.role,
      curUserRoleInGroup: state.group.currGroup.role || state.group.role,
      currGroup: state.group.currGroup
    };
  },
  {
    fetchNewsData: fetchNewsData,
    setCurrGroup
  }
)
export default class Group extends Component {
  constructor(props) {
    super(props);

    this.state = {
      groupId: -1
    }
  }

  // async componentDidMount() {
  //   let r = await axios.get('/api/group/get_mygroup')
  //   try {
  //     let group = r.data.data;
  //     this.setState({
  //       groupId: group._id
  //     })
  //     this.props.setCurrGroup(group)
  //   } catch (e) {
  //     console.error(e)
  //   }
  // }

  static propTypes = {
    fetchNewsData: PropTypes.func,
    curGroupId: PropTypes.number,
    curUserRole: PropTypes.string,
    currGroup: PropTypes.object,
    curUserRoleInGroup: PropTypes.string,
    setCurrGroup: PropTypes.func
  };
  // onTabClick=(key)=> {
  //   // if (key == 3) {
  //   //   this.props.fetchNewsData(this.props.curGroupId, "group", 1, 10)
  //   // }
  // }
  render() {
    return (
      <div className="projectGround">
        <Layout style={{ height: 'calc(100vh - 100px)', marginLeft: '16px', marginTop: '24px', overflow: 'hidden' }}>
          <Sider style={{ height: '100%', backgroundColor: '#ECEEF1' }} width={300}>
            <GroupList />
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
              <Switch>
                {/* <Redirect exact from="/space/group" to={"/space/group/" + this.state.groupId} /> */}
                <Route path="/space/group/:groupId" render={(props) => {
                  return <Project {...props}></Project>
                }} />
                <Route path="/space/home" component={Home} />
              </Switch>
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }
}
