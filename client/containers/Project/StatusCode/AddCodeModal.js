import React, { PureComponent as Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { axios } from "common/httpUtil";

import { Form, Modal, Button, Table, Select, Tree, Tag, Input, message } from 'antd';

const FormItem = Form.Item;

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class AddCodeModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null
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

    componentDidMount() {
        if (this.props.id) {
            this.loadData(this.props.id)
        }
    }

    loadData(id) {
        axios.get('/api/statusCode/getById', {
            params: {
                id: id
            }
        }).then(response => {
            this.setState({
                data: response.data
            })
        })
    }

    onSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                values.projectId = this.props.projectId;
                values.groupId = this.props.groupId;
                let code = {
                    projectId: this.props.projectId,
                    groupId: this.props.groupId,
                    code: values.code,
                    codeDescription: values.codeDescription,
                    _id: this.props.id
                }
                axios.post('/api/statusCode/save', code).then(res => {
                    if (res.errcode !== 0) {
                        return message.error(`${res.errmsg}, 新增错误码出现异常`);
                    } else {
                        this.props.onSubmit(res.data);
                        this.props.form.resetFields()
                    }
                });
            }
        });
    }


    render() {
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
        return (
            <Modal
                destroyOnClose={true}
                title="添加状态码"
                footer={null}
                visible={this.props.visible}
                className="addcatmodal"
                onCancel={() => {
                    this.props.form.resetFields();
                    if (this.props.onCancel) {
                        this.props.onCancel();
                    }
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
                            initialValue: this.state.data ? this.state.data.code || null : null
                        })(<Input placeholder="code" />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="描述">
                        {getFieldDecorator('codeDescription', {
                            initialValue: this.state.data ? this.state.data.codeDescription || null : null
                        })(<Input placeholder="描述" />)}
                    </FormItem>

                    <FormItem className="catModalfoot" wrapperCol={{ span: 24, offset: 8 }}>
                        <Button onClick={() => {
                            this.props.form.resetFields()
                            this.props.onCancel()
                        }}
                            style={{ marginRight: '10px' }}>
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
