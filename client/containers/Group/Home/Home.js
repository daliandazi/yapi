import React, { PureComponent as Component } from 'react';
import { Row, Col, Button, Tooltip, Table, Input, Select } from 'antd';
import { Link } from "react-router-dom";
import { axios } from 'common/httpUtil';
import { formatTime, safeArray } from "client/common.js";
export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            myInterfaceList: [],
            loading: false,
            myInterface: {
                list: [],
                count: 0,
                total: 0,
                pageNo: 1,
                limit: 10
            }
        };
    }
    myInterfaces = () => {
        this.setState({
            loading: true,
        })
        axios.get('/api/interface/my', {
            params: {
                page: this.state.myInterface.pageNo || 1
            }
        }).then(response => {

            let pageData = this.state.myInterface || {};

            pageData.list = response.data.list;
            pageData.count = response.data.count;
            pageData.total = response.data.total;
            this.setState({
                myInterfaceList: response.data.list,
                myInterface: pageData
            })
            this.setState({
                loading: false
            })
        })

    }
    componentWillMount() {
        this.myInterfaces()
    }
    render() {
        const MyInterface = () => {
            const pageConfig = {
                total: this.state.myInterface.count,
                pageSize: this.state.myInterface.limit || 15,
                showTotal: (total) => `共 ${this.state.myInterface.count} 条记录`,
                current: this.state.myInterface.pageNo,
                onChange: (current) => {
                    let myInterface = this.state.myInterface;
                    myInterface.pageNo = current;
                    this.setState({
                        myInterface: myInterface
                    }, this.myInterfaces)
                }
            };

            let status = {
                undone: "未完成",
                done: "已完成",
                invalid: "废弃",
            };

            let columns = [
                {
                    title: '接口名称',
                    dataIndex: 'title',
                    ellipsis: true,
                    render: (text, item) => {
                        return (
                            <Link
                                to={"/project/" + item.project_id + "/interface/api/" + item._id}
                            >
                                <span className="name">{text}</span>
                            </Link>
                        );
                    },
                },
                {
                    title: '接口路径',
                    dataIndex: 'path',
                    ellipsis: true,
                }, {
                    title: '状态',
                    dataIndex: 'status',
                    render: (text, item) => {

                        return (
                            status[text]
                        )
                    }
                },
                {
                    title: '创建人',
                    dataIndex: 'createUserName',
                    ellipsis: true,
                },
                {
                    title: '负责人',
                    dataIndex: 'connUsername',
                    ellipsis: true,
                    render: (text, item) => {
                        return (
                            text && text.length > 0 ? text : "未设置"
                        )
                    }
                },
                {
                    title: '修改时间',
                    dataIndex: 'up_time',
                    ellipsis: true,
                    render: (text, record) => {
                        return formatTime(text);
                    },
                }
            ];

            return (
                <div style={{ margin: '2px 2px 20px 2px' }}>
                    <h3 className="owner-type">我的接口</h3>
                    <div className="flex flex-1">
                        <div className="flex"><Input placeholder="接口名称或者路径" width={100}></Input></div>
                        <div className="flex-1">
                            <Select style={{ width: '200px' }} placeholder="负责人">
                                <Select.Option key={1}>张文杰</Select.Option>
                            </Select>
                        </div>
                    </div>
                    <Table loading={this.state.loading} style={{ marginTop: '10px' }} bordered columns={columns} dataSource={this.state.myInterfaceList} size="small" pagination={pageConfig}>

                    </Table>
                </div>
            )
        }
        return (
            <div style={{ paddingTop: '24px' }} className="m-panel card-panel card-panel-s project-list">
                <MyInterface></MyInterface>
            </div>
        )
    }

}