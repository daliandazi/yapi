import React, { PureComponent as Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Layout, Menu, Icon, Table, Button, Input, Tree, Modal } from 'antd';
import { Route, Switch, matchPath, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { axios } from 'common/httpUtil';
import Edit from './Edit'
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';
import View from './View'
const { TreeNode } = Tree;
const confirm = Modal.confirm;

@connect(
    state => {
        return {
            statusCodeList: [],
            projectId: null
        };
    }
)
class DataStructureList extends Component {

    static propTypes = {
        match: PropTypes.object,
        projectId: PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {
            statusCodeList: [],
            projectId: null,
            editCodeId: null,
            selectedDataKey: null
        };
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

    delete(id) {
        let that = this;
        const ref = confirm({
            title: "确定删除此状态码吗？",
            content: "温馨提示：删除后无法恢复",
            okText: "确认",
            cancelText: "取消",
            async onOk() {
                axios.post("/api/dataStructure/del", {
                    id: id,
                }).then(() => {
                    that.queryCodeList();
                });
            },
            onCancel() { },
        });
    }


    componentWillMount() {
        let params = this.props.match.params;
        let groupId = params.groupId;
        let projectId = params.id;

        this.setState({
            projectId: projectId,
            groupId: groupId
        }, () => {
            this.queryCodeList();
        })
    }

    componentWillReceiveProps(nextProps) {
        let _groupId = nextProps.match.params.groupId;
        let projectId = nextProps.match.params.id;
        if (_groupId) {
            if (_groupId && _groupId !== this.state.groupId) {
                this.setState({
                    projectId: projectId,
                    groupId: _groupId
                })
                this.queryCodeList(_groupId);
            }
        } else {
            this.setState({
                projectId: projectId,
                groupId: null
            }, () => {
                this.queryCodeList(_groupId);
            })
            console.log('没有groupId', nextProps.match.params)
        }

    }

    render() {

        const columns = [
            {
                title: '模板',
                width: 20,
                dataIndex: 'code'
            },
        ]

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
                        <Menu selectedKeys={this.state.selectedDataKey}>
                            {
                                this.state.statusCodeList.map((data) => {
                                    return (<Menu.Item key={data._id}>{data.name}</Menu.Item>)
                                })
                            }
                        </Menu>
                    </div>
                </ReflexElement>
                <ReflexSplitter />
                <ReflexElement>
                    <Switch>
                        <Route
                            path="/project/:projectId/dataStructure/view/:id"
                            component={View}
                        />
                        {/* <Route
                            path="/project/:id/dataStructure"
                            component={DataStructureList}
                        />  */}
                    </Switch>
                </ReflexElement>
            </ReflexContainer>

        )
    }
}

export default DataStructureList