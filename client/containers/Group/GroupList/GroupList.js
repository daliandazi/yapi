import React, { PureComponent as Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Modal, Input, message, Spin, Row, Menu, Col, Popover, Tooltip, Button } from 'antd';
import { autobind } from 'core-decorators';
import axios from 'axios';
import { Route, Switch, Redirect, Link, useParams } from 'react-router-dom';
import { withRouter } from 'react-router-dom';
const { TextArea } = Input;
const Search = Input.Search;
import UsernameAutoComplete from '../../../components/UsernameAutoComplete/UsernameAutoComplete.js';
import GuideBtns from '../../../components/GuideBtns/GuideBtns.js';
import { fetchNewsData } from '../../../reducer/modules/news.js';
import {
  fetchGroupList,
  setCurrGroup,
  setGroupList,
  fetchGroupMsg
} from '../../../reducer/modules/group.js';
import _ from 'underscore';

import './GroupList.scss';

const tip = (
  <div className="title-container">
    <h3 className="title">欢迎使用 YApi ~</h3>
    <p>
      这里的 <b>“个人空间”</b>{' '}
      是你自己才能看到的分组，你拥有这个分组的全部权限，可以在这个分组里探索 YApi 的功能。
    </p>
  </div>
);

@connect(
  state => ({
    groupList: state.group.groupList,
    currGroup: state.group.currGroup,
    curUserRole: state.user.role,
    curUserRoleInGroup: state.group.currGroup.role || state.group.role,
    studyTip: state.user.studyTip,
    study: state.user.study
  }),
  {
    fetchGroupList,
    setCurrGroup,
    setGroupList,
    fetchNewsData,
    fetchGroupMsg
  }
)
@withRouter
export default class GroupList extends Component {
  static propTypes = {
    groupList: PropTypes.array,
    currGroup: PropTypes.object,
    fetchGroupList: PropTypes.func,
    setCurrGroup: PropTypes.func,
    setGroupList: PropTypes.func,
    match: PropTypes.object,
    history: PropTypes.object,
    curUserRole: PropTypes.string,
    curUserRoleInGroup: PropTypes.string,
    studyTip: PropTypes.number,
    study: PropTypes.bool,
    fetchNewsData: PropTypes.func,
    fetchGroupMsg: PropTypes.func
  };

  state = {
    addGroupModalVisible: false,
    newGroupName: '',
    newGroupDesc: '',
    currGroupName: '',
    currGroupDesc: '',
    groupList: [],
    owner_uids: []
  };

  constructor(props) {
    super(props);
  }

  async componentWillMount() {
    const groupId = !isNaN(this.props.match.params.groupId)
      ? parseInt(this.props.match.params.groupId)
      : 0;
    // 获取空间列表
    await this.props.fetchGroupList();
    // console.log(this.props)
    let currGroup = false;
    // console.log("groupId",groupId)
    if (!groupId) {
      // return
    }
    return;
    if (this.props.groupList.length && groupId && groupId > 0) {
      for (let i = 0; i < this.props.groupList.length; i++) {
        if (this.props.groupList[i]._id === groupId) {
          currGroup = this.props.groupList[i];
        }
      }
    } else if (!groupId && this.props.groupList.length) {
      this.props.history.push(`/space/group/${this.props.groupList[0]._id}`);
    }
    if (!currGroup) {
      currGroup = this.props.groupList[0] || { group_name: '', group_desc: '' };
      this.props.history.replace(`${currGroup._id}`);
    }
    this.setState({ groupList: this.props.groupList });
    this.props.setCurrGroup(currGroup);
  }

  @autobind
  showModal() {
    this.setState({
      addGroupModalVisible: true
    });
  }
  @autobind
  hideModal() {
    this.setState({
      newGroupName: '',
      group_name: '',
      owner_uids: [],
      addGroupModalVisible: false
    });
  }
  @autobind
  async addGroup() {
    const { newGroupName: group_name, newGroupDesc: group_desc, owner_uids } = this.state;
    const res = await axios.post('/api/group/add', { group_name, group_desc, owner_uids });
    if (!res.data.errcode) {
      this.setState({
        newGroupName: '',
        group_name: '',
        owner_uids: [],
        addGroupModalVisible: false
      });
      await this.props.fetchGroupList();
      this.setState({ groupList: this.props.groupList });
      const id = res.data.data._id;
      const currGroup = _.find(this.props.groupList, group => {
        return +group._id === +id;
      });
      this.props.setCurrGroup(currGroup);
      this.props.fetchGroupMsg(this.props.currGroup._id);
      this.props.fetchNewsData(this.props.currGroup._id, 'group', 1, 10);
    } else {
      message.error(res.data.errmsg);
    }
  }
  @autobind
  async editGroup() {
    const { currGroupName: group_name, currGroupDesc: group_desc } = this.state;
    const id = this.props.currGroup._id;
    const res = await axios.post('/api/group/up', { group_name, group_desc, id });
    if (res.data.errcode) {
      message.error(res.data.errmsg);
    } else {
      await this.props.fetchGroupList();

      this.setState({ groupList: this.props.groupList });
      const currGroup = _.find(this.props.groupList, group => {
        return +group._id === +id;
      });

      this.props.setCurrGroup(currGroup);
      // this.props.setCurrGroup({ group_name, group_desc, _id: id });
      this.props.fetchGroupMsg(this.props.currGroup._id);
      this.props.fetchNewsData(this.props.currGroup._id, 'group', 1, 10);
    }
  }
  @autobind
  inputNewGroupName(e) {
    this.setState({ newGroupName: e.target.value });
  }
  @autobind
  inputNewGroupDesc(e) {
    this.setState({ newGroupDesc: e.target.value });
  }

  @autobind
  selectGroup(e) {
    const groupId = e.key;
    // const currGroup = this.props.groupList.find((group) => { return +group._id === +groupId });
    const currGroup = _.find(this.props.groupList, group => {
      return +group._id === +groupId;
    });
    this.props.setCurrGroup(currGroup);
    this.props.history.push('/space/group/' + `${currGroup._id}`);
    // this.props.history.replace(`${currGroup._id}`);
    this.props.fetchNewsData(groupId, 'group', 1, 10);
  }

  @autobind
  onUserSelect(uids) {
    this.setState({
      owner_uids: uids
    });
  }

  @autobind
  searchGroup(e, value) {
    const v = value || e.target.value;
    const { groupList } = this.props;
    if (v === '') {
      this.setState({ groupList });
    } else {
      this.setState({
        groupList: groupList.filter(group => new RegExp(v, 'i').test(group.group_name))
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    // GroupSetting 组件设置的分组信息，通过redux同步到左侧分组菜单中
    if (this.props.groupList !== nextProps.groupList) {
      this.setState({
        groupList: nextProps.groupList
      });
    }
  }

  render() {
    const { currGroup } = this.props;
    return (
      <div className="m-group">
        <div className="system-menu" style={{ backgroundColor: '#fff', borderRadius: '4px', overflow: "hidden", boxShadow: '0 0 6px 2px #D9D9D9', marginBottom: '10px' }}>
          <div style={{ padding: "20px 10px", backgroundColor: '#fff' }}>
            <span style={{ fontSize: '18px', fontWeight: "500" }}>面板</span>
          </div>
          <div>
            <Menu
              mode="inline"
            >
              <Menu.Item>
                <Link to="/space/home">
                  <Icon type="home" /> 首页
                </Link>
              </Menu.Item>
              <Menu.Item>
                <Icon type="dashboard" /> Dashboard
              </Menu.Item>
              <Menu.Item>
                <Icon type="star" /> 收藏
              </Menu.Item>
            </Menu>
          </div>
        </div>
        {!this.props.study ? <div className="study-mask" /> : null}
        <div className="group-bar">
          <div style={{ borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ padding: "20px 10px", backgroundColor: '#fff' }}>
              <span style={{ fontSize: '18px', fontWeight: "500" }}>空间</span>
            </div>
            <div style={{ padding: '5px' }}>
              <Button size="small" icon="plus" onClick={this.showModal}>创建空间</Button>
            </div>
            {this.state.groupList.length === 0 && <Spin style={{
              marginTop: 20,
              display: 'flex',
              justifyContent: 'center'
            }} />}
            <div className="group-menu">
              <Menu
                mode="inline"
                onClick={this.selectGroup}
                selectedKeys={[`${currGroup._id}`]}
              >
                {this.state.groupList.map(group => {
                  if (group.type === 'private') {
                    return (
                      <Menu.Item
                        key={`${group._id}`}
                        className="group-item"
                        style={{ zIndex: this.props.studyTip === 0 ? 3 : 1 }}
                      >
                        <Icon type="user" />
                        <Popover
                          overlayClassName="popover-index"
                          content={<GuideBtns />}
                          title={tip}
                          placement="right"
                          visible={this.props.studyTip === 0 && !this.props.study}
                        >
                          {group.group_name}
                        </Popover>
                      </Menu.Item>
                    );
                  } else {
                    return (
                      <Menu.Item key={`${group._id}`} className="group-item">
                        <Icon type="folder-open" />
                        {group.group_name}
                      </Menu.Item>
                    );
                  }
                })}
              </Menu>
            </div>
          </div>
        </div>
        {this.state.addGroupModalVisible ? (
          <Modal
            title="添加分组"
            visible={this.state.addGroupModalVisible}
            onOk={this.addGroup}
            onCancel={this.hideModal}
            className="add-group-modal"
          >
            <Row gutter={6} className="modal-input">
              <Col span="5">
                <div className="label">分组名：</div>
              </Col>
              <Col span="15">
                <Input placeholder="请输入分组名称" onChange={this.inputNewGroupName} />
              </Col>
            </Row>
            <Row gutter={6} className="modal-input">
              <Col span="5">
                <div className="label">简介：</div>
              </Col>
              <Col span="15">
                <TextArea rows={3} placeholder="请输入分组描述" onChange={this.inputNewGroupDesc} />
              </Col>
            </Row>
            <Row gutter={6} className="modal-input">
              <Col span="5">
                <div className="label">组长：</div>
              </Col>
              <Col span="15">
                <UsernameAutoComplete callbackState={this.onUserSelect} />
              </Col>
            </Row>
          </Modal>
        ) : (
          ''
        )}
      </div>
    );
  }
}
