import React, { PureComponent as Component } from "react";
import PropTypes from "prop-types";
import {
  Layout,
  Menu,
  Icon,
  Button,
  Tree,
  Popover,
  Modal,
  Empty
} from "antd";
import { Route, Switch, matchPath, Link } from "react-router-dom";
import { connect } from "react-redux";
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import { axios } from "common/httpUtil";
import AddGroupModal from "./AddGroupModal";
import StatusCodeList from "./StatusCodeList";

const { Content, Sider } = Layout;
const { TreeNode } = Tree;
const confirm = Modal.confirm;

@connect((state) => {
  return {
    statusCodeGroupList: [],
  };
})
class StatusCode extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    projectId: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      statusCodeGroupList: [],
      editGroupId: null
    };
  }

  async queryGroupList() {
    axios
      .get("/api/statusCode/group/list?projectId=" + this.props.match.params.id)
      .then((response) => {
        this.setState({
          statusCodeGroupList: response.data,
        });
      });
  }

  async selectedGroup(groupId) {
    if (!groupId || groupId.length == 0) {
      return;
    }
    this.props.history.push(
      "/project/" +
      this.props.match.params.id +
      "/statusCode/list/" +
      groupId[0]
    );
  }

  leaveItem = () => {
    this.setState({ delIcon: null });
  };

  editGroup(groupId) {
    this.setState({
      editGroupId: groupId,
      add_group_modal_visible: true,
    });
  }

  delGroup(groupId) {
    let that = this;
    const ref = confirm({
      title: "确定删除此分组吗？",
      content: "温馨提示：该操作会删除该分组下所有状态码，删除后无法恢复",
      okText: "确认",
      cancelText: "取消",
      async onOk() {
        axios
          .post("/api/statusCode/group/del", {
            groupId: groupId,
          })
          .then(() => {
            that.queryGroupList();
          });
      },
      onCancel() { },
    });
  }

  async componentDidMount() {
    let params = this.props.match.params;
    this.setState({
      projectId: params.id,
    });
    this.queryGroupList();
  }

  render() {
    return (
      <ReflexContainer style={{ height: "calc(100vh - 80px)" }} orientation="vertical">
        <ReflexElement
          style={{
            height: "100%",
            overflow: "hidden",
            borderLeft: "1px solid #D9D9D9",
            border: "1px solid #D9D9D9",
            backgroundColor: '#fff'
          }}
          id={"interface-sider"}
          size={250}
        >
          {this.state.add_group_modal_visible ? (
            <AddGroupModal
              visible={this.state.add_group_modal_visible}
              projectId={this.state.projectId}
              groupId={this.state.editGroupId}
              onCancel={() => {
                this.setState({
                  add_group_modal_visible: false,
                });
              }}
              onSubmit={() => {
                this.setState({
                  add_group_modal_visible: false,
                });
                this.queryGroupList()
              }}
            />
          ) : (
            ""
          )}
          <div
            className="left-menu"
            style={{ height: parseInt(document.body.clientHeight) - 80 + "px" }}
          >
            <div style={{ padding: "8px 10px", borderBottom: "1px solid #D9D9D9", }}>
              <Button
                icon="plus"
                type="primary"
                onClick={() => {
                  this.setState({
                    editGroupId: null,
                    add_group_modal_visible: true,
                  });
                }}
              >
                添加分组
              </Button>
            </div>


            <Menu mode="inline">
              <Menu.Item
                className="item"
                style={{ borderBottom: "1px dashed #D9D9D9" }}
              >
                <Link
                  to={
                    "/project/" +
                    this.props.match.params.id +
                    "/statusCode/list"
                  }
                >
                  <Icon type="menu" style={{ marginRight: 5 }} />
                  所有状态码
                </Link>
              </Menu.Item>
            </Menu>
            {
              this.state.statusCodeGroupList.length <= 0 ? (<Empty description="还没有状态码哦~"></Empty>) : ("")
            }
            <Tree
              onSelect={(selectedKeys) => {
                this.selectedGroup(selectedKeys);
              }}
            >
              {this.state.statusCodeGroupList.map((item) => {
                return (
                  <TreeNode
                    key={item._id}
                    title={
                      <div onMouseLeave={this.leaveItem}>
                        {item.groupName}
                        <div className="btns">
                          <Popover
                            placement="leftTop"
                            content={
                              <div className="IM-menu">
                                <div>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      this.editGroup(item._id);
                                    }}
                                  >
                                    <Icon type="edit" /> 编辑
                                  </span>
                                </div>

                                <div>
                                  <span
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      this.delGroup(item._id);
                                    }}
                                  >
                                    <Icon type="delete" /> 删除
                                  </span>
                                </div>
                              </div>
                            }
                          >
                            <Icon type="ellipsis" />
                          </Popover>
                        </div>
                      </div>
                    }
                  ></TreeNode>
                );
              })}
            </Tree>
          </div>
        </ReflexElement>
        <ReflexSplitter />
        <ReflexElement>
          <Content
            style={{
              height: "100%",
              overflow: "hidden",
              border: "1px solid #D9D9D9",
              borderLeft: "0px solid #D9D9D9",
              backgroundColor: "#fff",
            }}
          >
            <Switch>
              <Route
                path="/project/:id/statusCode/list/:groupId"
                component={StatusCodeList}
              />
              <Route
                path="/project/:id/statusCode"
                component={StatusCodeList}
              />
            </Switch>
          </Content>
        </ReflexElement>
      </ReflexContainer>
    );
  }
}

export default StatusCode;
