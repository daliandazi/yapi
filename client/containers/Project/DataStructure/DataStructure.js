import React, { PureComponent as Component } from "react";
import PropTypes from "prop-types";
import {
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
import Tippy from '@tippyjs/react';
import { followCursor } from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // optional

import { axios } from "common/httpUtil";
import AddGroupModal from "./AddGroupModal";
import DataStructureList from "./DataStructureList";
import View from './View'
import Edit from './Edit'
import './index.scss'

const { TreeNode } = Tree;
const confirm = Modal.confirm;

@connect((state) => {
    return {
        statusCodeGroupList: [],
    };
})
class DataStructure extends Component {
    static propTypes = {
        match: PropTypes.object,
        history: PropTypes.object,
        projectId: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {
            statusCodeGroupList: [],
            statusCodeList: [],
            editGroupId: null,
            selectedGroupId: null,
        };
    }

    async queryGroupList() {
        axios
            .get("/api/dataStructure/all?projectId=" + this.props.match.params.projectId)
            .then((response) => {
                this.setState({
                    statusCodeGroupList: response.data,
                });
            });
    }

    queryCodeList(groupId) {
        if (!groupId && this.state.groupId) {
            groupId = this.state.groupId
        }
        axios.get('/api/dataStructure/list', {
            params: {
                groupId: groupId,
                projectId: this.state.projectId
            }
        }).then(response => {
            this.setState({
                statusCodeList: response.data,
                groupId: groupId
            })
        })
    }

    addDataStructure(groupId) {
        this.setState({
            selectedGroupId: groupId,
            add_code_modal_visible: true
        })
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
                    .post("/api/dataStructure/group/del", {
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
            projectId: params.projectId,
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

                    {this.state.add_code_modal_visible === true ? (
                        <Edit
                            id={this.state.editCodeId}
                            visible={this.state.add_code_modal_visible} projectId={this.state.projectId}
                            onSubmit={() => {
                                this.queryGroupList()
                                this.setState({
                                    add_code_modal_visible: false,
                                    editCodeId: null
                                })
                            }
                            }
                            onCancel={() => {
                                this.setState({
                                    add_code_modal_visible: false,
                                    editCodeId: null
                                })
                            }
                            }
                            groupId={this.state.selectedGroupId}
                        />
                    ) : ""
                    }
                    <div
                        className="left-menu"
                        style={{ height: parseInt(document.body.clientHeight) - 80 + "px" }}
                    >
                        <div style={{ padding: "10px 10px", borderBottom: "1px solid #D9D9D9", }}>
                            <Button
                                icon="plus"
                                type="primary"
                                size="small"
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

                        {
                            this.state.statusCodeGroupList.length <= 0 ? (<Empty description="还没有模板哦~"></Empty>) : ("")
                        }
                        <Menu mode="inline" onSelect={({ item, key, keyPath, selectedKeys, domEvent }) => {
                            this.props.history.push(
                                "/project/" +
                                this.props.match.params.projectId +
                                "/dataStructure/" + key + "/view"

                            );
                        }}>
                            {this.state.statusCodeGroupList.map((item, i) => {
                                return (
                                    <Menu.SubMenu
                                        key={item._id}
                                        title={<div>
                                            <Popover
                                                placement="bottom"
                                                trigger="contextMenu"
                                                overlayStyle={{ zIndex: '10000000' }}
                                                content={
                                                    <div className="popup">
                                                        <div>
                                                            <span
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    this.addDataStructure(item._id)
                                                                }}
                                                            >
                                                                <Icon type="plus" /> 添加模板
                                                            </span>
                                                        </div>


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
                                                <div>{item.groupName}</div>
                                            </Popover>

                                        </div>}
                                        onContextMenu={(e) => {
                                            // e.preventDefault()
                                            // console.log(e)
                                        }}
                                    >
                                        {
                                            item.children.map((s, j) => {
                                                return (<Menu.Item key={s._id} >
                                                    <div>
                                                        {s.name}
                                                        <div style={{ position: 'absolute', right: '0px', top: '50%', transform: "translateY(-60%)", height: '30px', width: '30px', color: '000' }}>
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
                                                                <div><Icon type="ellipsis" /></div>
                                                            </Popover></div>
                                                    </div>
                                                </Menu.Item>)
                                            })
                                        }

                                    </Menu.SubMenu>
                                )
                            })}

                        </Menu>
                        {/* <Tree
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
                        </Tree> */}
                    </div>
                </ReflexElement>
                <ReflexSplitter />
                <ReflexElement>
                    <div
                        style={{
                            height: "100%",
                            overflow: "hidden",
                            border: "1px solid #D9D9D9",
                            borderLeft: "0px solid #D9D9D9",
                            backgroundColor: "#fff",
                        }}
                    >
                        <ReflexContainer style={{ height: "calc(100vh - 80px)" }} orientation="vertical">
                            {/* <ReflexElement
                                style={{
                                    height: "100%",
                                    overflow: "hidden",
                                    borderLeft: "1px solid #D9D9D9",
                                    border: "1px solid #D9D9D9",
                                    backgroundColor: '#fff'
                                }}
                                id={"interface-sider"}
                                size={300}
                            >
                                <div style={{ height: '30px', padding: '10px 10px ' }}>
                                    {this.state.groupId ? (
                                        <Button
                                            icon="plus"
                                            type="primary"
                                            size="small"
                                            onClick={() => {
                                                this.setState({
                                                    add_code_modal_visible: true
                                                })
                                            }}
                                        >添加模板</Button>
                                    ) : ('')}

                                </div>
                                {this.state.add_code_modal_visible === true ? (
                                    <Edit
                                        id={this.state.editCodeId}
                                        visible={this.state.add_code_modal_visible} projectId={this.state.projectId}
                                        onSubmit={() => {
                                            this.queryCodeList()
                                            this.setState({
                                                add_code_modal_visible: false,
                                                editCodeId: null
                                            })
                                        }
                                        }
                                        onCancel={() => {
                                            this.setState({
                                                add_code_modal_visible: false,
                                                editCodeId: null
                                            })
                                        }
                                        }
                                        groupId={this.state.groupId}
                                    />
                                ) : ""
                                }
                                <div style={{ marginTop: '20px', overflowY: 'auto', height: 'calc(100vh - 130px)' }}>
                                    <Menu selectedKeys={this.state.selectedDataKey} onClick={(e) => {
                                        console.log(e.key)

                                        this.props.history.push(
                                            "/project/" +
                                            this.props.match.params.projectId +
                                            "/dataStructure/" + e.key + "/view"

                                        );
                                    }}>
                                        {
                                            this.state.statusCodeList ? this.state.statusCodeList.map((data) => {
                                                return (<Menu.Item key={data._id}>{data.name}</Menu.Item>)
                                            }) : (null)
                                        }
                                    </Menu>
                                </div>
                            </ReflexElement> */}
                            {/* <ReflexSplitter /> */}
                            <ReflexElement>
                                <Switch>
                                    <Route
                                        path="/project/:projectId/dataStructure/:dataStructureId/view"
                                        component={View}
                                    />
                                </Switch>
                            </ReflexElement>
                        </ReflexContainer>
                    </div>
                </ReflexElement>
            </ReflexContainer>
        );
    }
}

export default DataStructure;
