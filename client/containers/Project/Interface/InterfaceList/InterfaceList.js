import React, { PureComponent as Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import axios from "axios";
import produce from 'immer';
import { Table, Button, Modal, message, Tooltip, Select, Icon } from "antd";
import AddInterfaceForm from "./AddInterfaceForm";
import {
  fetchInterfaceListMenu,
  fetchInterfaceList,
  fetchInterfaceCatList,
  fetchInterfaceData,
  deleteInterfaceData,
} from "@reducer/modules/interface.js";
import { getProject } from "@reducer/modules/project.js";
import { Link } from "react-router-dom";
import variable from "client/constants/variable";
import "./Edit.scss";
import Label from "@components/Label/Label.js";
import { formatTime, safeArray } from "client/common.js";
import AddForkDocForm from "./AddForkDocForm";

const confirm = Modal.confirm;
const Option = Select.Option;
const limit = 20;

@connect(
  (state) => {
    return {
      curData: state.inter.curdata,
      curProject: state.project.currProject,
      catList: state.inter.list,
      totalTableList: state.inter.totalTableList,
      catTableList: state.inter.catTableList,
      totalCount: state.inter.totalCount,
      count: state.inter.count,
    };
  },
  {
    fetchInterfaceListMenu,
    fetchInterfaceList,
    fetchInterfaceCatList,
    deleteInterfaceData,
    getProject,
    fetchInterfaceData,
  }
)
class InterfaceList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: [],
      catid: null,
      total: null,
      current: 1,
    };
  }

  static propTypes = {
    curData: PropTypes.object,
    catList: PropTypes.array,
    match: PropTypes.object,
    curProject: PropTypes.object,
    history: PropTypes.object,
    fetchInterfaceListMenu: PropTypes.func,
    deleteInterfaceData: PropTypes.func,
    fetchInterfaceList: PropTypes.func,
    fetchInterfaceData: PropTypes.func,
    fetchInterfaceCatList: PropTypes.func,
    totalTableList: PropTypes.array,
    catTableList: PropTypes.array,
    totalCount: PropTypes.number,
    count: PropTypes.number,
    getProject: PropTypes.func,
  };

  handleRequest = async (props) => {
    const { params } = props.match;
    if (!params.actionId) {
      let projectId = params.id;
      this.setState({
        catid: null,
      });
      let option = {
        page: this.state.current,
        limit,
        project_id: projectId,
      };
      await this.props.fetchInterfaceList(option);
      this.setState({
        loading: false,
      });
    } else if (isNaN(params.actionId)) {
      let catid = params.actionId.substr(4);
      this.setState({ catid: +catid });
      let option = {
        page: this.state.current,
        limit,
        catid,
      };

      await this.props.fetchInterfaceCatList(option);
      this.setState({
        loading: false,
      });
    }
  };

  // 更新分类简介
  handleChangeInterfaceCat = (desc, name) => {
    let params = {
      catid: this.state.catid,
      name: name,
      desc: desc,
    };

    axios.post("/api/interface/up_cat", params).then(async (res) => {
      if (res.data.errcode !== 0) {
        return message.error(res.data.errmsg);
      }
      let project_id = this.props.match.params.id;
      await this.props.getProject(project_id);
      await this.props.fetchInterfaceListMenu(project_id);
      message.success("接口集合简介更新成功");
    });
  };
  handleChange = (pagination, filters, sorter) => {
    this.setState({
      sortedInfo: sorter,
    });
  };

  componentWillMount() {
    this.actionId = this.props.match.params.actionId;
    this.handleRequest(this.props);
  }

  componentWillReceiveProps(nextProps) {
    let _actionId = nextProps.match.params.actionId;

    if (this.actionId !== _actionId) {
      this.actionId = _actionId;
      this.setState(
        {
          current: 1,
          loading: true,
        },
        () => this.handleRequest(nextProps)
      );
    }
  }

  handleDelInterface = (data) => {
    let that = this;
    let id = data._id;
    let projectId = this.props.curProject._id;
    let catid = data.catid;
    let title = data.ref_id ? "移除关联" : "删除";
    let content = data.ref_id
      ? "移除关联不会删除原始接口"
      : "接口删除后，无法恢复";
    const ref = confirm({
      title: `您确认${title}此接口????`,
      content: `温馨提示：${content}`,
      okText: "确认",
      cancelText: "取消",
      async onOk() {
        await that.props.deleteInterfaceData(id, projectId);
        that.handleRequest(that.props);
        // await that.getList();
        // await that.props.fetchInterfaceCatList({ catid });
        ref.destroy();
        // that.props.history.push(
        //     '/project/' + that.props.match.params.id + '/interface/api/cat_' + catid
        // );
      },
      onCancel() {
        ref.destroy();
      },
    });
  };

  /**
   * 复制接口
   * @param {*} id 
   */
  copyInterface = async id => {
    let interfaceData = await this.props.fetchInterfaceData(id);
    // let data = JSON.parse(JSON.stringify(interfaceData.payload.data.data));
    // data.title = data.title + '_copy';
    // data.path = data.path + '_' + Date.now();
    let data = interfaceData.payload.data.data;
    let newData = produce(data, draftData => {
      draftData.title = draftData.title + '_copy';
      draftData.path = draftData.path.trim() + '_' + new Date().getTime();
    });


    axios.post('/api/interface/add', newData).then(async res => {
      if (res.data.errcode !== 0) {
        return message.error(res.data.errmsg);
      }
      message.success('接口添加成功');
      this.handleRequest(this.props);
    });
  };

  handleAddInterface = (data) => {
    data.project_id = this.props.curProject._id;
    axios.post("/api/interface/add", data).then((res) => {
      if (res.data.errcode !== 0) {
        return message.error(
          `${res.data.errmsg}, 你可以在左侧的接口列表中对接口进行删改`
        );
      }
      message.success("接口添加成功");
      let interfaceId = res.data.data._id;
      this.props.history.push(
        "/project/" + data.project_id + "/interface/api/" + interfaceId
      );
      this.props.fetchInterfaceListMenu(data.project_id);
    });
  };

  changeInterfaceCat = async (id, catid) => {
    const params = {
      id: id,
      catid,
    };
    let result = await axios.post("/api/interface/up", params);
    if (result.data.errcode === 0) {
      message.success("修改成功");
      this.handleRequest(this.props);
      this.props.fetchInterfaceListMenu(this.props.curProject._id);
    } else {
      message.error(result.data.errmsg);
    }
  };

  changeInterfaceStatus = async (value) => {
    const params = {
      id: value.split("-")[0],
      status: value.split("-")[1],
    };
    let result = await axios.post("/api/interface/up", params);
    if (result.data.errcode === 0) {
      message.success("修改成功");
      this.handleRequest(this.props);
    } else {
      message.error(result.data.errmsg);
    }
  };

  changePage = (current) => {
    this.setState(
      {
        current: current,
      },
      () => this.handleRequest(this.props)
    );
  };

  render() {
    let tag = this.props.curProject.tag;
    let filter = tag.map((item) => {
      return { text: item.name, value: item.name };
    });

    const columns = [
      {
        key: "p",
        width: 2,
      },
      {
        title: "接口名称",
        dataIndex: "title",
        key: "title",
        width: 30,
        render: (text, item) => {
          return (
            <Link
              to={"/project/" + item.project_id + "/interface/api/" + item._id}
            >
              <span className="name">{text}</span>
            </Link>
          );
        },
      },
      {
        title: "URL",
        dataIndex: "path",
        key: "path",
        width: 50,
        render: (item, record) => {
          const path = this.props.curProject.basepath + item;
          let methodColor =
            variable.METHOD_COLOR[
            record.method ? record.method.toLowerCase() : "get"
            ] || variable.METHOD_COLOR["get"];
          return (
            <div>
              <span
                style={{
                  color: methodColor.color,
                  backgroundColor: methodColor.bac,
                }}
                className="colValue"
              >
                {record.method}
              </span>
              <Tooltip title="开放接口" placement="topLeft">
                <span>
                  {record.api_opened && (
                    <Icon className="opened" type="eye-o" />
                  )}
                </span>
              </Tooltip>
              <Tooltip
                title={path}
                placement="topLeft"
                overlayClassName="toolTip"
              >
                <span className="path">{path}</span>
              </Tooltip>
            </div>
          );
        },
      },
      // {
      //   title: '接口分类',
      //   dataIndex: 'catid',
      //   key: 'catid',
      //   width: 28,
      //   render: (item, record) => {
      //     return (
      //       <Select
      //         value={item + ''}
      //         className="select path"
      //         onChange={catid => this.changeInterfaceCat(record._id, catid)}
      //       >
      //         {this.props.catList.map(cat => {
      //           return (
      //             <Option key={cat.id + ''} value={cat._id + ''}>
      //               <span>{cat.name}</span>
      //             </Option>
      //           );
      //         })}
      //       </Select>
      //     );
      //   }
      // },
      {
        title: "状态",
        dataIndex: "status",
        key: "status",
        width: 20,
        render: (text, record) => {
          const key = record.key;
          let status = variable.INTERFACE_STATUS[text];

          return (
            <Select
              value={key + "-" + text}
              className="select"
              onChange={this.changeInterfaceStatus}
            >
              <Option value={key + "-done"}>
                <span className="tag-status done">{status.label}</span>
              </Option>
              <Option value={key + "-undone"}>
                <span className="tag-status undone">未完成</span>
              </Option>
              <Option value={key + "-invalid"}>
                <span className="tag-status invalid">废弃</span>
              </Option>
            </Select>
          );
        },
        filters: [
          {
            text: "已完成",
            value: "done",
          },
          {
            text: "未完成",
            value: "undone",
          },
          {
            text: "废弃",
            value: "invalid",
          },
        ],
        onFilter: (value, record) => record.status.indexOf(value) === 0,
      },

      {
        title: "负责人",
        dataIndex: "connUsername",
        width: 20,
      },
      {
        title: "创建者",
        dataIndex: "createUserName",
        width: 20,
      },
      {
        title: "更新时间",
        dataIndex: "up_time",
        key: "up_time",
        width: 20,
        ellipsis: true,
        render: (text, record) => {
          return formatTime(text);
        },
      },
      {
        title: "操作",
        width: 20,
        render: (text, record) => {
          return (
            <div>
              <Button
                type="link"
                onClick={() => {
                  this.handleDelInterface(record);
                }}
              >
                {record.ref_id ? "移除" : "删除"}
              </Button>

              <Button
                type="link"
                onClick={() => {
                  this.copyInterface(record._id);
                }}
              >
                复制
              </Button>
            </div>
          );
        },
      },
    ];
    let intername = "",
      desc = "";
    let cat = this.props.curProject ? this.props.curProject.cat : [];

    if (cat) {
      for (let i = 0; i < cat.length; i++) {
        if (cat[i]._id === this.state.catid) {
          intername = cat[i].name;
          desc = cat[i].desc;
          break;
        }
      }
    }
    // const data = this.state.data ? this.state.data.map(item => {
    //   item.key = item._id;
    //   return item;
    // }) : [];
    let data = [];
    let total = 0;
    const { params } = this.props.match;
    if (!params.actionId) {
      data = this.props.totalTableList;
      total = this.props.totalCount;
    } else if (isNaN(params.actionId)) {
      data = this.props.catTableList;
      total = this.props.count;
    }

    data = data.map((item) => {
      item.key = item._id;
      return item;
    });

    const pageConfig = {
      total: total,
      pageSize: limit,
      showTotal: (total) => `共 ${total} 条记录`,
      current: this.state.current,
      onChange: this.changePage,
    };

    const isDisabled = false;// this.props.match.params.actionId?true:false
    // console.log(this.props.catList)
    // console.log(this.props.curProject.tag)

    return (
      <div style={{ padding: "0px" }}>
        <div
          style={{
            maxHeight: "54px",
            borderBottom: "1px solid #D9D9D9",
            padding: "8px 10px",
          }}
        >
          <Button
            icon="plus"
            disabled={isDisabled}
            type="primary"
            onClick={() => this.setState({ visible: true })}
          >
            添加接口
          </Button>

          <Button
            style={{ marginLeft: "10px" }}
            icon="plus"
            disabled={isDisabled}
            type="primary"
            onClick={() => this.setState({ add_fork_modal_visible: true })}
          >
            关联接口
          </Button>

          <Button
            style={{ marginLeft: "10px" }}
            icon="plus"
            disabled={isDisabled}
            type="primary"
            onClick={() => this.handleRequest(this.props)}
          >
            刷新
          </Button>
        </div>
        {/* <h2 className="interface-title" style={{ display: 'inline-block', margin: 0 }}>
          {intername ? intername : '全部接口'}共 ({total}) 个
        </h2> */}

        {/* <div style={{ marginTop: '10px' }}>
          <Label onChange={value => this.handleChangeInterfaceCat(value, intername)} desc={desc} />
        </div> */}
        <Table
          style={{ height: "calc(100vh - 230px)" }}
          className="table-interfacelist"
          scroll={{
            x: 1200,
            y: parseInt(document.body.clientHeight) - 230,
            scrollToFirstRowOnChange: true,
          }}
          pagination={pageConfig}
          columns={columns}
          rowKey={(record) => record.key}
          onChange={this.handleChange}
          bordered
          loading={this.state.loading}
          size="small"
          dataSource={data}
        />

        {this.state.visible && (
          <Modal
            title="添加接口"
            visible={this.state.visible}
            onCancel={() => this.setState({ visible: false })}
            footer={null}
            className="addcatmodal"
          >
            <AddInterfaceForm
              catid={this.state.catid}
              catdata={cat}
              onCancel={() => this.setState({ visible: false })}
              onSubmit={this.handleAddInterface}
            />
          </Modal>
        )}

        {this.state.add_fork_modal_visible ? (
          <AddForkDocForm
            visible={this.state.add_fork_modal_visible}
            catdata={this.state.curCatdata}
            onCancel={() => {
              this.setState({
                add_fork_modal_visible: false,
              });
            }}
            onSubmit={(data) => {
              if (data && data.length > 0) {
                for (let i in data) {
                  let d = data[i];

                  if (d.cat === true) {
                  } else {
                    let api = {
                      catid: this.state.catid,
                      project_id: this.props.match.params.id,
                      type: "ref",
                      ref_id: d.key,
                    };
                    axios.post("/api/interface/add", api).then((res) => {
                      if (res.data.errcode !== 0) {
                        return message.error(
                          `${res.data.errmsg}, 关联接口出现异常`
                        );
                      }
                    });
                  }
                }
                this.handleRequest(this.props);
              }
              this.setState({
                add_fork_modal_visible: false,
              });
            }}
          />
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default InterfaceList;
