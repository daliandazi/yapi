import React, { PureComponent as Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col, Button, Tooltip, Table, Input, Select } from 'antd';
import { Link } from 'react-router-dom';
import {
  addProject,
  fetchProjectList,
  delProject,
  changeUpdateModal
} from '../../../reducer/modules/project';
import ProjectCard from '../../../components/ProjectCard/ProjectCard.js';
import ErrMsg from '../../../components/ErrMsg/ErrMsg.js';
import { autobind } from 'core-decorators';
import { setBreadcrumb } from '../../../reducer/modules/user';
import { axios } from 'common/httpUtil';
import { formatTime, safeArray } from "client/common.js";
import './ProjectList.scss';

@connect(
  state => {
    return {
      projectList: state.project.projectList,
      userInfo: state.project.userInfo,
      tableLoading: state.project.tableLoading,
      currGroup: state.group.currGroup,
      currPage: state.project.currPage
    };
  },
  {
    fetchProjectList,
    addProject,
    delProject,
    changeUpdateModal,
    setBreadcrumb
  }
)
class ProjectList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      protocol: 'http://',
      projectData: [],
      myInterfaceList: [],
      myInterface: {
        list: [],
        count: 0,
        total: 0,
        pageNo: 1
      }
    };
  }
  static propTypes = {
    form: PropTypes.object,
    fetchProjectList: PropTypes.func,
    addProject: PropTypes.func,
    delProject: PropTypes.func,
    changeUpdateModal: PropTypes.func,
    projectList: PropTypes.array,
    userInfo: PropTypes.object,
    tableLoading: PropTypes.bool,
    currGroup: PropTypes.object,
    setBreadcrumb: PropTypes.func,
    currPage: PropTypes.number,
    studyTip: PropTypes.number,
    study: PropTypes.bool
  };

  // 取消修改
  @autobind
  handleCancel() {
    this.props.form.resetFields();
    this.setState({
      visible: false
    });
  }

  // 修改线上域名的协议类型 (http/https)
  @autobind
  protocolChange(value) {
    this.setState({
      protocol: value
    });
  }

  // 获取 ProjectCard 组件的关注事件回调，收到后更新数据

  receiveRes = () => {
    this.props.fetchProjectList(this.props.currGroup._id, this.props.currPage);
  };

  myInterfaces = () => {
    axios.get('/api/interface/my', {
      params: {
        page: this.state.myInterface.pageNo || 1
      }
    }).then(response => {

      let pageData = this.state.myInterface || {};

      pageData.list = response.data.list;
      pageData.count = response.data.count;
      pageData.total = response.data.total;
      this.setState({
        myInterfaceList: response.data.list,
        myInterface: pageData
      })
    })

  }

  componentWillReceiveProps(nextProps) {
    this.myInterfaces()
    this.props.setBreadcrumb([{ name: '' + (nextProps.currGroup.group_name || '') }]);

    // 切换分组
    if (this.props.currGroup !== nextProps.currGroup && nextProps.currGroup._id) {
      this.props.fetchProjectList(nextProps.currGroup._id, this.props.currPage);
    }

    // 切换项目列表
    if (this.props.projectList !== nextProps.projectList) {
      // console.log(nextProps.projectList);
      const data = nextProps.projectList.map((item, index) => {
        item.key = index;
        return item;
      });
      this.setState({
        projectData: data
      });
    }
  }

  render() {
    let projectData = this.state.projectData;
    let noFollow = [];
    let followProject = [];
    for (var i in projectData) {
      if (projectData[i].follow) {
        followProject.push(projectData[i]);
      } else {
        noFollow.push(projectData[i]);
      }
    }
    followProject = followProject.sort((a, b) => {
      return b.up_time - a.up_time;
    });
    noFollow = noFollow.sort((a, b) => {
      return b.up_time - a.up_time;
    });
    projectData = [...followProject, ...noFollow];

    const isShow = /(admin)|(owner)|(dev)/.test(this.props.currGroup.role);

    const Follow = () => {
      return followProject.length ? (
        <Row>
          <h3 className="owner-type">我的关注</h3>
          {followProject.map((item, index) => {
            return (
              <Col xs={8} lg={6} xxl={4} key={index}>
                <ProjectCard projectData={item} callbackResult={this.receiveRes} />
              </Col>
            );
          })}
        </Row>
      ) : null;
    };
    const NoFollow = () => {
      return noFollow.length ? (
        <Row style={{ borderBottom: '1px solid #eee', marginBottom: '15px' }}>
          <h3 className="owner-type">我的项目</h3>
          {noFollow.map((item, index) => {
            return (
              <Col xs={8} lg={6} xxl={4} key={index}>
                <ProjectCard projectData={item} callbackResult={this.receiveRes} isShow={isShow} />
              </Col>
            );
          })}
        </Row>
      ) : null;
    };

    const MyInterface = () => {
      const pageConfig = {
        total: this.state.myInterface.count,
        pageSize: this.state.myInterface.limit || 15,
        showTotal: (total) => `共 ${this.state.myInterface.count} 条记录`,
        current: this.state.myInterface.pageNo,
        onChange: (current) => {
          let myInterface = this.state.myInterface;
          myInterface.pageNo = current;
          this.setState({
            myInterface: myInterface
          }, this.myInterfaces)
        }
      };
      let columns = [
        {
          title: '接口名称',
          dataIndex: 'title'
        },
        {
          title: '接口路径',
          dataIndex: 'path'
        }, {
          title: '状态',
          dataIndex: 'status'
        },
        {
          title: '创建人',
          dataIndex: 'createUserName'
        },
        {
          title: '负责人',
          dataIndex: 'connUsername'
        },
        {
          title: '修改时间',
          dataIndex: 'up_time',
          render: (text, record) => {
            return formatTime(text);
          },
        }
      ];

      return (
        <div style={{ margin: '2px 2px 20px 2px' }}>
          <h3 className="owner-type">我的接口</h3>
          <div className="flex flex-1">
            <div className="flex"><Input placeholder="接口名称或者路径" width={100}></Input></div>
            <div className="flex-1">
              <Select style={{ width: '200px' }} placeholder="负责人">
                <Select.Option key={1}>张文杰</Select.Option>
              </Select>
            </div>
          </div>
          <Table bordered columns={columns} dataSource={this.state.myInterfaceList} size="small" pagination={pageConfig}>

          </Table>
        </div>
      )
    }

    const OwnerSpace = () => {
      return projectData.length ? (
        <div>
          <MyInterface />
          <NoFollow />
          <Follow />
        </div>
      ) : (
        <ErrMsg type="noProject" />
      );
    };

    return (
      <div style={{ paddingTop: '24px' }} className="m-panel card-panel card-panel-s project-list">
        <Row className="project-list-header">
          <Col span={16} style={{ textAlign: 'left' }}>
            {this.props.currGroup.group_name} 分组共 ({projectData.length}) 个项目
          </Col>
          <Col span={8}>
            {isShow ? (
              <Link to="/add-project">
                <Button type="primary">添加项目</Button>
              </Link>
            ) : (
              <Tooltip title="您没有权限,请联系该分组组长或管理员">
                <Button type="primary" disabled>
                  添加项目
                </Button>
              </Tooltip>
            )}
          </Col>
        </Row>
        <Row style={{ height: 'calc(100vh - 270px)', overflowY: 'auto' }}>
          {/* {projectData.length ? projectData.map((item, index) => {
            return (
              <Col xs={8} md={6} xl={4} key={index}>
                <ProjectCard projectData={item} callbackResult={this.receiveRes} />
              </Col>);
          }) : <ErrMsg type="noProject" />} */}
          {this.props.currGroup.type === 'private' ? (
            <OwnerSpace />
          ) : projectData.length ? (
            projectData.map((item, index) => {
              return (
                <Col xs={8} lg={6} xxl={4} key={index}>
                  <ProjectCard
                    projectData={item}
                    callbackResult={this.receiveRes}
                    isShow={isShow}
                  />
                </Col>
              );
            })
          ) : (
            <ErrMsg type="noProject" />
          )}
        </Row>
      </div>
    );
  }
}

export default ProjectList;
