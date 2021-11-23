import React, { PureComponent as Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { axios } from "common/httpUtil";

import {
  Form,
  Modal,
  Button,
  Table,
  Select,
  Tree,
  Tag,
  Input,
  message,
} from "antd";

const FormItem = Form.Item;

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some((field) => fieldsError[field]);
}

class AddGroupModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: this.props.visible,
      group:{}
    };
  }

  static propTypes = {
    form: PropTypes.object,
    visible: PropTypes.bool,
    projectId: PropTypes.string,
    groupId: PropTypes.number,
    onCancel: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  componentDidMount() {
    if(this.props.groupId){
      this.loadGroup(this.props.groupId)
    }
  }

  loadGroup(groupId) {
    axios.get("/api/statusCode/group/get", {
      params: {
        groupId: groupId,
      },
    }).then(response=>{
      console.log(response.data)
      this.setState({
        group:response.data
      })
    })
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if(this.state.group && this.state.group._id){
          values.projectId = this.state.group.projectId;
          values.parentId = this.state.group.parentId;
          values.inedx = this.state.group.inedx;
          values._id = this.state.group._id;
        }else{
          values.projectId = this.props.projectId;
        }


        axios.post("/api/statusCode/group/save", values).then((res) => {
          if (res.errcode !== 0) {
            return message.error(`${res.errmsg}, 添加分组出现异常`);
          }
          this.props.form.resetFields();
          if (this.props.onSubmit) {
            this.props.onSubmit();
          }
        });
      }
    });
  };

  render() {
    const { getFieldDecorator, getFieldsError } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };
    return (
      <Modal
        title="添加分组"
        footer=""
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
          <FormItem {...formItemLayout} label="分组名">
            {getFieldDecorator("groupName", {
              rules: [
                {
                  required: true,
                  message: "请输入分类名称!",
                },
              ],
              initialValue: this.state.group
                ? this.state.group.groupName || null
                : null,
            })(<Input placeholder="分类名称" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="描述">
            {getFieldDecorator("desc", {
              initialValue: this.state.group
                ? this.state.group.desc || null
                : null,
            })(<Input placeholder="描述" />)}
          </FormItem>

          <FormItem
            className="catModalfoot"
            wrapperCol={{ span: 24, offset: 8 }}
          >
            <Button
              onClick={() => {
                this.props.form.resetFields();
                if (this.props.onCancel) {
                  this.props.onCancel();
                }
              }}
              style={{ marginRight: "10px" }}
            >
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              disabled={hasErrors(getFieldsError())}
            >
              提交
            </Button>
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

export default Form.create()(AddGroupModal);
