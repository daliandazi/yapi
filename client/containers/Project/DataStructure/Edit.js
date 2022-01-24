import React, { PureComponent as Component } from 'react';
import PropTypes from 'prop-types';
import { axios } from "common/httpUtil";
import { Form, Modal, Button, Tag, Input, Icon, message } from 'antd';
// import jSchema from 'json-schema-editor-visual';
import jSchema from "@components/jsEditor/index.js"
import json5 from 'json5';
import { MOCK_SOURCE } from '../../../constants/variable.js';
const ResBodySchema = jSchema({ lang: 'zh_CN', mock: MOCK_SOURCE });
const FormItem = Form.Item;

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

function checkIsJsonSchema(json) {
    try {
        json = json5.parse(json);
        if (json.properties && typeof json.properties === 'object' && !json.type) {
            json.type = 'object';
        }
        if (json.items && typeof json.items === 'object' && !json.type) {
            json.type = 'array';
        }
        if (!json.type) {
            return false;
        }
        json.type = json.type.toLowerCase();
        let types = ['object', 'string', 'number', 'array', 'boolean', 'integer'];
        if (types.indexOf(json.type) === -1) {
            return false;
        }
        return JSON.stringify(json);
    } catch (e) {
        return false;
    }
}

class Edit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: {}
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
        axios.get('/api/dataStructure/getById', {
            params: {
                id: id
            }
        }).then(response => {
            if (response.data) {
                if (response.data.structure) {
                    response.data.structure = checkIsJsonSchema(response.data.structure)
                }
            }
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
                    projectId: this.props.projectId || this.state.data.projectId,
                    groupId: this.props.groupId || this.state.data.groupId,
                    code: values.code,
                    name: values.name,
                    structure: this.state.data.structure,
                    description: values.description,
                    _id: this.props.id
                }
                axios.post('/api/dataStructure/save', code).then(res => {
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
                title="编辑模板"
                footer={null}
                width="1000px"
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
                    <FormItem {...formItemLayout} label="模板名称">
                        {getFieldDecorator('name', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入模板名称!'
                                }
                            ],
                            initialValue: this.state.data ? this.state.data.name || null : null
                        })(<Input placeholder="模板名称" />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="模板编号">
                        {getFieldDecorator('code', {
                            rules: [
                                {
                                    required: true,
                                    message: '请输入模板编号!'
                                }
                            ],
                            initialValue: this.state.data ? this.state.data.code || null : null
                        })(<Input placeholder="模板编号" />)}
                    </FormItem>
                    <FormItem {...formItemLayout} label="描述">
                        {getFieldDecorator('description', {
                            initialValue: this.state.data ? this.state.data.description || null : null
                        })(<Input placeholder="描述" />)}
                    </FormItem>
                    <div style={{ marginTop: '10px', padding: '0 10px ', }}>
                        <div style={{ minHeight: '300px', maxHeight: '500px', overflowY: 'auto' }}>
                            <ResBodySchema
                                onChange={text => {
                                    let data = this.state.data;
                                    data.structure = text;
                                    this.setState({
                                        data: data
                                    });
                                    // if (new Date().getTime() - this.startTime > 1000) {
                                    //     EditFormContext.props.changeEditStatus(true);
                                    // }
                                }}
                                isMock={true}
                                data={this.state.data.structure ? this.state.data.structure : false}
                            ></ResBodySchema>
                        </div>
                    </div>
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

export default Form.create()(Edit);
