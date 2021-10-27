import React, {PureComponent as Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

import {Button, Form, Modal, Select, Tag, Tree} from 'antd';
import {fetchInterfaceCatList, fetchInterfaceList, fetchInterfaceListMenu} from '@reducer/modules/interface.js';
import {fetchGroupList} from '@reducer/modules/group';

const FormItem = Form.Item;
const Option = Select.Option;
const { TreeNode } = Tree;

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

@connect(
    state => {
        return {
            curProject: state.project.currProject,
            catList: state.inter.list,
            totalTableList: state.inter.totalTableList,
            catTableList: state.inter.catTableList,
            totalCount: state.inter.totalCount,
            count: state.inter.count
        };
    },
    {
        fetchInterfaceListMenu,
        fetchInterfaceList,
        fetchInterfaceCatList,
        fetchGroupList
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
            visible: this.props.visible
        };
    }
    static propTypes = {
        form: PropTypes.object,
        catdata: PropTypes.object,
        fetchGroupList: PropTypes.func,
        visible: PropTypes.bool,
        onCancel: PropTypes.func,
        onSubmit: PropTypes.func
    };

    changeState = (key, value) => {
        //visible add_cat_modal_visible change_cat_modal_visible del_cat_modal_visible
        let newState = {};
        newState[key] = value;
        this.setState(newState);
    };

    getGroupList() {
        axios.get('/api/group/list').then(res => {
            let result = res.data;
            if (result.errcode === 0) {
                let list = result.data;
                this.setState({
                    groupData: list
                });
            }
        });
    }

    async getProjectList(groupId) {
        if (this.selectedGroup == groupId) {
            return;
        }

        this.setState({
            selectedGroup: groupId
        });
        let api = "/api/project/list?group_id=" + groupId + "&page=1&limit=10";
        const response = await (await axios.get(api)).data;

        if (response.errcode === 0) {
            const projectList = response.data.list;
            for (let i in projectList) {
                const project = projectList[i];
                const ins = await this.getInterfaceList(project._id);
                project.intefaceList = ins;
            }
            this.setState({
                projectData: projectList,
            });
        }

    }

    async getInterfaceList(projectId) {
        let response = await (await axios.get('/api/interface/list',{
            params:{
                project_id:projectId,
                limit:'all'
            }
        })).data;
        if (response.errcode === 0) {
            return response.data.list;
        }
        return [];
    }


    getChildren(project) {
        return project.intefaceList ? (
            project.intefaceList.map(interfaceObj => {
                <TreeNode title={interfaceObj.name} key={interfaceObj._id} >

                </TreeNode>
            })

        ) : "";

    }

    onSubmit = (e) => {
        e.preventDefault();
        if (this.props && this.props.onSubmit) {
            let result = []
            for (let i in this.state.selectedNodes) {
                let node = this.state.selectedNodes[i]
                // console.log(node)
                let nodeType = node.props.nodeType;
                let n = {
                    key: node.key,
                };
                if (nodeType === 'cat') {
                    n.cat = true;
                } else {
                    n.cat = false;
                }
                result.push(n)
            }

            this.props.onSubmit(result)
        }
    }

    // 自定义title
    rendertitle = (interfaceObj) => (
        <div style={{ display: 'flex' }} onClick={e => e.stopPropagation()}>
            {this.methodTag(interfaceObj.method)} {interfaceObj.title} {interfaceObj.path}
        </div>
    )

    methodTag = (method) => {
        if (method == 'POST') {
            return <Tag color="red">{method}</Tag>
        } else {
            return <Tag color="green">{method}</Tag>
        }

    }

    async componentDidMount() {
        this.getGroupList()
    }

    render() {

        let columns = [
            {
                title: '项目名称',
                dataIndex: 'name',
                key: 'name',
                width: 180,

            }
        ];

        const { getFieldDecorator, getFieldsError } = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 6 }
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 }
            }
        };

        const pageConfig = {
            total: this.state.total,
            pageSize: 30,
            current: this.state.current,
            onChange: this.changePage
        };

        return (
            <Modal
                title="添加文档"
                okText="保存"
                footer={null}
                visible={this.props.visible}
                className="addcatmodal"
                onCancel={() => {
                    if (this.props.onCancel) {
                        this.props.onCancel();
                    }
                    // this.setState({
                    //     visible: false
                    // })
                }}
            >
                <div style={{ padding: 10, height: 400, overflowY: 'auto' }}>
                    选择空间： <Select style={{ width: 200 }} onChange={value => this.getProjectList(value)}>
                        {
                            this.state.groupData.map(g => {
                                return (
                                    <Option value={g._id} key={g._id}>
                                        {g.group_name}
                                    </Option>
                                );
                            })
                        }
                    </Select>
                    <div style={{ marginTop: 20 }}>

                    </div>
                    <Tree
                        checkable
                        multiple
                        onSelect={(selectedKeys, e) => {
                        }}
                        onCheck={(checkedKeys, e) => {
                            this.setState({
                                selectedNodes: e.checkedNodes
                            })
                        }}
                    >
                        {
                            this.state.projectData.map(project => {
                                return (
                                    <TreeNode nodeType="cat" title={project.name} key={project._id}>
                                        {
                                            project.intefaceList ? (
                                                project.intefaceList.map(interfaceObj => {
                                                    return (
                                                        <TreeNode nodeType="interface" title={this.rendertitle(interfaceObj)} key={interfaceObj._id} >

                                                        </TreeNode>
                                                    )
                                                })

                                            ) : ""
                                        }
                                    </TreeNode>
                                )
                            })
                        }



                    </Tree>
                </div>
                <div className="catModalfoot">
                    <Button onClick={this.props.onCancel} style={{ marginRight: '10px' }}>
                        取消
                    </Button>
                    <Button type="primary" htmlType="submit" onClick={this.onSubmit} disabled={hasErrors(getFieldsError())}>
                        提交
                    </Button>
                </div>
            </Modal>
        );
    }
}

export default Form.create()(AddForkDocForm);
