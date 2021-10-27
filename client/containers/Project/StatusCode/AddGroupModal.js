import React, {PureComponent as Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import axios from 'axios';

import {Form, Modal, Button, Table, Select, Tree, Tag, Input, message} from 'antd';

const FormItem = Form.Item;
const Option = Select.Option;
const {TreeNode} = Tree;

import {
    fetchInterfaceListMenu,
    fetchInterfaceList,
    fetchInterfaceCatList
} from '@reducer/modules/interface.js';
import {fetchGroupList} from '@reducer/modules/group';

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
class AddGroupModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: this.props.visible
        };
    }

    static propTypes = {
        form: PropTypes.object,
        visible: PropTypes.bool,
        projectId: PropTypes.string,
        onCancel: PropTypes.func,
        onSubmit: PropTypes.func
    };

    onSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                values.projectId = this.props.projectId;
                console.log(values)


                axios.post('/api/statusCode/group/save', values).then(res => {
                    if (res.data.errcode !== 0) {
                        return message.error(`${res.data.errmsg}, 添加分组出现异常`);
                    }
                    this.props.form.resetFields();
                    if (this.props.onSubmit) {
                        this.props.onSubmit()
                    }
                });
            }
        });
    }


    async componentDidMount() {
    }

    render() {
        const {getFieldDecorator, getFieldsError} = this.props.form;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6}
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 14}
            }
        };
        return (
            <Modal
                title="添加分组"
                okText="保存"
                footer={null}
                visible={this.props.visible}
                className="addcatmodal"
                onCancel={() => {
                    this.props.form.resetFields()
                    if (this.props.onCancel) {
                        this.props.onCancel();
                    }
                }}
            >
                <Form onSubmit={this.onSubmit}>
                    <FormItem {...formItemLayout} label="分组名">
                        {getFieldDecorator('groupName', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入分类名称!'
                                }
                            ],
                            initialValue: this.props.catdata ? this.props.catdata.name || null : null
                        })(<Input placeholder="分类名称"/>)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="备注">
                        {getFieldDecorator('desc', {
                            initialValue: this.props.catdata ? this.props.catdata.desc || null : null
                        })(<Input placeholder="备注"/>)}
                    </FormItem>

                    <FormItem className="catModalfoot" wrapperCol={{span: 24, offset: 8}}>
                        <Button onClick={() => {
                            this.props.form.resetFields();
                            if (this.props.onCancel) {
                                this.props.onCancel();
                            }
                        }} style={{marginRight: '10px'}}>
                            取消
                        </Button>
                        <Button type="primary" htmlType="submit" disabled={hasErrors(getFieldsError())}>
                            提交
                        </Button>
                    </FormItem>
                </Form>
            </Modal>
        );
    }
}

export default Form.create()(AddGroupModal);
