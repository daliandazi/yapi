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
class AddCodeModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: this.props.visible
        };
    }

    static propTypes = {
        form: PropTypes.object,
        id: PropTypes.number,
        visible: PropTypes.bool,
        projectId: PropTypes.string,
        groupId: PropTypes.string,
        onCancel: PropTypes.func,
        onSubmit: PropTypes.func
    };

    componentWillUnmount() {
        console.log('==')
    }

    onSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                values.projectId = this.props.projectId;
                values.groupId = this.props.groupId;
                axios.post('/api/statusCode/save', values).then(res => {
                    if (res.data.errcode !== 0) {
                        return message.error(`${res.data.errmsg}, 新增错误码出现异常`);
                    } else {
                        this.props.onSubmit(res.data);
                        this.props.form.resetFields()
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
                title="添加状态码"
                footer={null}
                visible={this.props.visible}
                className="addcatmodal"
                onCancel={() => {
                    if (this.props.onCancel) {
                        this.props.onCancel();
                    }
                    this.props.form.resetFields()
                }}
            >
                <Form onSubmit={this.onSubmit}>
                    <FormItem {...formItemLayout} label="code">
                        {getFieldDecorator('code', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入code!'
                                }
                            ],
                            initialValue: this.props.data ? this.props.data.name || null : null
                        })(<Input placeholder="code"/>)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="描述">
                        {getFieldDecorator('codeDescription', {
                            initialValue: this.props.data ? this.props.data.codeDescription || null : null
                        })(<Input placeholder="描述"/>)}
                    </FormItem>

                    <FormItem className="catModalfoot" wrapperCol={{span: 24, offset: 8}}>
                        <Button onClick={() => {
                            this.props.form.resetFields()
                            this.props.onCancel()
                        }}
                                style={{marginRight: '10px'}}>
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

export default Form.create()(AddCodeModal);
