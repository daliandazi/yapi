import React, { PureComponent as Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Layout, Menu, Icon, Table, Button, Input } from 'antd';
import { Route, Switch, matchPath, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';

const { Content, Sider } = Layout;


@connect(
    state => {
        return {
        };
    }
)
class StatusCodeList extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    async componentDidMount() {
    }

    render() {

        const columns = [
            {
                title: '错误码',
                width: 2,
                dataIndex: 'code',
            },
            {
                title: '描述',
                width: 2,
                dataIndex: "codeDescription"
            },
            {
                title: '分组',
                width: 2,
                dataIndex: 'groupName'
            },
            {
                title: '操作',
                width: 2,
            }
        ]

        const data = [
            {
                codeID: 1,
                code: '0',
                codeDescription: '返回正常',
                groupName: '基础'
            }, {
                codeID: 2,
                code: '-1',
                codeDescription: '返回异常',
                groupName: '基础'
            }
        ]

        return (
            <Layout style={{ height: 'calc(100vh - 80px)' }}>
                <Sider style={{ height: '100%', overflow: 'hidden', borderLeft: '1px solid #D9D9D9', border: '1px solid #D9D9D9', }} ref={this.interfaceSiderFun} id={'interface-sider'} width={300}>
                    <div className="left-menu" style={{ height: parseInt(document.body.clientHeight) - 80 + 'px' }}>
                        <div style={{ padding: '10px' }}>
                            <Button
                                icon="plus"
                                type="primary"
                            >添加分组</Button>
                        </div>

                        <div style={{ borderTop: '1px solid #D9D9D9', borderBottom: '1px solid #D9D9D9', padding: '6px 10px' }}>
                            <Input style={{ width: '100%' }} placeholder="搜索分组" />
                        </div>

                        <Menu
                            mode="inline"
                        >
                            <Menu.Item
                                className="item"
                                style={{ borderBottom: '1px dashed #D9D9D9' }}
                            >
                                <Icon type="menu" style={{ marginRight: 5 }} />
                                所有状态码
                            </Menu.Item>
                        </Menu>
                    </div>
                </Sider>
                <Layout>
                    <Content
                        style={{
                            height: '100%',
                            overflow: 'hidden',
                            border: '1px solid #D9D9D9',
                            borderLeft: '0px solid #D9D9D9',
                            backgroundColor: '#fff'
                        }}
                    >
                        <div style={{ backgroundColor: '#fff', height: 'calc(100vh - 80px)' }}>
                            <div style={{ height: '30px', padding: '10px 10px ' }}>
                                <Button
                                    icon="plus"
                                    type="primary"
                                >添加状态码</Button>
                            </div>
                            <div style={{ marginTop: '20px',overflowY:'auto' ,height: 'calc(100vh - 130px)'}}>

                                <Table
                                    style={{ margin: '10px 10px' }}
                                    columns={columns}
                                    dataSource={data}
                                    bordered
                                    size="small"
                                >

                                </Table>
                            </div>
                        </div>
                    </Content>
                </Layout>
            </Layout>

        )
    }
}

export default StatusCodeList