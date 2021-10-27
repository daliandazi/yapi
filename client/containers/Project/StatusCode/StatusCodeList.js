import React, {PureComponent as Component} from 'react';
import PropTypes from 'prop-types';
import {Tabs, Layout, Menu, Icon, Table, Button, Input, Tree} from 'antd';
import {Route, Switch, matchPath, Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {axios} from 'common/httpUtil';
import AddCodeModal from './AddCodeModal'

const {Content, Sider} = Layout;
const {TreeNode} = Tree;

@connect(
    state => {
        return {
            statusCodeList: [],
            projectId: null
        };
    }
)
class StatusCodeList extends Component {

    static propTypes = {
        match: PropTypes.object,
        projectId: PropTypes.string
    };

    constructor(props) {
        super(props);
        this.state = {
            statusCodeList: [],
            projectId: null
        };
    }

    queryCodeList(groupId) {
        if (!groupId && this.state.groupId) {
            groupId = this.state.groupId
        }
        axios.get('/api/statusCode/list', {
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
                title: '错误码',
                width: 2,
                dataIndex: 'code'
            },
            {
                title: '描述',
                width: 5,
                dataIndex: "codeDescription"
            },
            {
                title: '操作',
                width: 2,
                render: (text, record) => {
                    return (
                        <div>
                            <Button type="link">编辑</Button><Button type="link">删除</Button>
                        </div>
                    );
                }
            }
        ]

        return (
            <div style={{backgroundColor: '#fff', height: 'calc(100vh - 80px)'}}>
                <div style={{height: '30px', padding: '10px 10px '}}>
                    {this.state.groupId ? (
                        <Button
                            icon="plus"
                            type="primary"
                            onClick={() => {
                                this.setState({
                                    add_code_modal_visible: true
                                })
                            }}
                        >添加状态码</Button>
                    ) : ('')}

                </div>
                {
                    <AddCodeModal
                        visible={this.state.add_code_modal_visible} projectId={this.state.projectId}
                        onSubmit={() => {
                            this.queryCodeList()
                            this.setState({
                                add_code_modal_visible: false
                            })
                        }
                        }
                        onCancel={() => {
                            this.setState({
                                add_code_modal_visible: false
                            })
                        }
                        }
                        groupId={this.state.groupId}
                    />
                }
                <div style={{marginTop: '20px', overflowY: 'auto', height: 'calc(100vh - 130px)'}}>

                    <Table
                        style={{margin: '10px 10px'}}
                        columns={columns}
                        dataSource={this.state.statusCodeList}
                        bordered
                        size="small"
                    >

                    </Table>
                </div>
            </div>

        )
    }
}

export default StatusCodeList