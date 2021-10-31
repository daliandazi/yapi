import React, { PureComponent as Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import axios from "axios";
import qs from "qs";

import { Button, Form, Modal, Select, Tag, Tree, Spin } from "antd";
import {
  fetchInterfaceCatList,
  fetchInterfaceList,
  fetchInterfaceListMenu,
} from "@reducer/modules/interface.js";
import { fetchGroupList } from "@reducer/modules/group";

const FormItem = Form.Item;
const Option = Select.Option;
const { TreeNode } = Tree;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some((field) => fieldsError[field]);
}

@connect(
  (state) => {
    return {
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
    fetchGroupList,
  }
)
class AddForkDocForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      groupData: [],
      projectData: [],
      total: 0,
      current: 1,
      backups: [],
      selectedGroup: null,
      isSearch: false,
      selectedNodes: [],
      visible: this.props.visible,
      loading: false,
    };
  }

  static propTypes = {
    form: PropTypes.object,
    catdata: PropTypes.object,
    fetchGroupList: PropTypes.func,
    visible: PropTypes.bool,
    onCancel: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  changeState = (key, value) => {
    //visible add_cat_modal_visible change_cat_modal_visible del_cat_modal_visible
    let newState = {};
    newState[key] = value;
    this.setState(newState);
  };

  getGroupList() {
    axios.get("/api/group/list").then((res) => {
      let result = res.data;
      if (result.errcode === 0) {
        let list = result.data;
        this.setState({
          groupData: list,
        });
      }
    });
  }

  async getProjectList(groupId) {
    if (this.selectedGroup == groupId) {
      return;
    }

    this.setState({
      selectedGroup: groupId,
      loading: true,
    });
    let api = "/api/project/list?group_id=" + groupId + "&page=1&limit=10";
    const response = await (await axios.get(api)).data;

    if (response.errcode === 0) {
      let projectList = response.data.list;
      let pids = projectList.map((p) => p._id);
      const { interfaces } = await this.getInterfaceList(pids);
      // for (let i in projectList) {
      //   const project = projectList[i];
      //   const ins = await this.getInterfaceList(project._id);
      //   project.intefaceList = ins;
      // }
      projectList = projectList
        .filter((p) => interfaces[p._id])
        .map((p) => {
          return p;
        });
      this.setState({
        projectData: projectList,
        interfaces: interfaces,
      });
    }

    this.setState({
      loading: false,
    });
  }

  async getInterfaceList(projectId) {
    let response = await (
      await axios.get("/api/interface/findByProjects", {
        params: {
          projectIds: projectId,
        },
        paramsSerializer: (params) => {
          return qs.stringify(params, { indices: false });
        },
      })
    ).data;
    if (response.errcode === 0) {
      return response.data;
    }
    return [];
  }

  getChildren(project) {
    return project.intefaceList
      ? project.intefaceList.map((interfaceObj) => {
          <TreeNode title={interfaceObj.name} key={interfaceObj._id} />;
        })
      : "";
  }

  onSubmit = (e) => {
    e.preventDefault();
    if (this.props && this.props.onSubmit) {
      let result = [];
      for (let i in this.state.selectedNodes) {
        let node = this.state.selectedNodes[i];
        // console.log(node)
        let nodeType = node.props.nodeType;
        let n = {
          key: node.key,
        };
        if (nodeType === "cat") {
          n.cat = true;
        } else {
          n.cat = false;
        }
        result.push(n);
      }

      this.props.onSubmit(result);
    }
  };

  // 自定义title
  renderTitle = (interfaceObj) => (
    <div style={{ display: "flex" }} onClick={(e) => e.stopPropagation()}>
      {this.methodTag(interfaceObj.method)} {interfaceObj.title}{" "}
      {interfaceObj.path}
    </div>
  );

  methodTag = (method) => {
    if (method == "POST") {
      return <Tag color="red">{method}</Tag>;
    } else {
      return <Tag color="green">{method}</Tag>;
    }
  };

  async componentDidMount() {
    this.getGroupList();
  }

  render() {

    const { getFieldDecorator, getFieldsError } = this.props.form;

    return (
      <Modal
        title="关联接口文档"
        footer={null}
        width={800}
        maskClosable={false}
        keyboard={false}
        visible={this.props.visible}
        className="ForkDocModal"
        onCancel={() => {
          if (this.props.onCancel) {
            this.props.onCancel();
          }
        }}
      >
        <div>
          <div
            style={{
              textAlign: "center",
              borderBottom: "1px solid #E9E9E9",
              padding: "10px",
            }}
          >
            选择空间：{" "}
            <Select
              style={{ width: 500 }}
              onChange={(value) => this.getProjectList(value)}
            >
              {this.state.groupData.map((g) => {
                return (
                  <Option value={g._id} key={g._id}>
                    {g.group_name}
                  </Option>
                );
              })}
            </Select>
          </div>
          <div style={{ marginTop: 20 }}></div>
          <Spin spinning={this.state.loading}>
            <div
              style={{
                height: 600,
                overflowY: "auto",
                padding: "20px",
                border: "1px solid #E9E9E9",
                margin: "10px",
              }}
            >
              <Tree
                checkable
                multiple
                onSelect={(selectedKeys, e) => {}}
                onCheck={(checkedKeys, e) => {
                  this.setState({
                    selectedNodes: e.checkedNodes,
                  });
                }}
              >
                {this.state.projectData.map((project) => {
                  return (
                    <TreeNode
                      nodeType="cat"
                      title={project.name}
                      key={project._id}
                    >
                      {this.state.interfaces[project._id]
                        ? this.state.interfaces[project._id].map(
                            (interfaceObj) => {
                              return (
                                <TreeNode
                                  nodeType="interface"
                                  title={this.renderTitle(interfaceObj)}
                                  key={interfaceObj._id}
                                ></TreeNode>
                              );
                            }
                          )
                        : ""}
                    </TreeNode>
                  );
                })}
              </Tree>
            </div>
          </Spin>
        </div>
        <div
          style={{
            height: "40px",
            paddingTop:'5px',
            alignItems: "end",
            alignContent: "end",
            textAlign: "right",
            marginRight: "20px",
            borderTop: "1px solid #E9E9E9",
          }}
        >
          <Button onClick={this.props.onCancel} style={{ marginRight: "10px" }}>
            取消
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            onClick={this.onSubmit}
            disabled={hasErrors(getFieldsError())}
          >
            提交
          </Button>
        </div>
      </Modal>
    );
  }
}

export default Form.create()(AddForkDocForm);
