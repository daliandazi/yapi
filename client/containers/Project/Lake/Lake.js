import React, { PureComponent as Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Layout, Menu, Icon, Table, Button, Input, Tree } from 'antd';
import { Route, Switch, matchPath, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';

const { Content, Sider } = Layout;
const { TreeNode } = Tree;

@connect(
    state => {
        return {
        };
    }
)
class Lake extends Component {

    constructor(props) {
        super(props);
        this.state = {
            docHtml: "",
            doc: {},
            docList: [],
            selectedDocKey: null,
        };
    }

    async componentDidMount() {
        axios.get("/api/yuque/getDocsByNamespace").then(response => {
            console.log(response.data)
            this.setState({
                docList: response.data.data
            })
        });
    }

    getDocDetail() {
        if (!this.state.selectedDocKey) {
            return
        }
        axios.get("/api/yuque/getDoc?slug=" + this.state.selectedDocKey).then((response) => {
            console.log(response.data.data)
            this.setState({
                docHtml: response.data.data.body_html,
                doc: response.data.data
            })
        });
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
                            >添加文档</Button>
                        </div>

                        <div style={{ borderTop: '1px solid #D9D9D9', borderBottom: '1px solid #D9D9D9', padding: '6px 10px' }}>
                            <Input style={{ width: '100%' }} placeholder="搜索文档" />
                        </div>

                        <div style={{ overflowY: 'auto' }}>
                            <Tree className="interface-list"
                                onSelect={(selectedKeys, e) => {
                                    console.log(selectedKeys)
                                    this.setState({
                                        selectedDocKey: selectedKeys
                                    }, this.getDocDetail)
                                }}
                            >
                                {
                                    this.state.docList.filter(doc => {
                                        return doc.status == 1
                                    }).map(doc => {
                                        return <TreeNode title={doc.title} key={doc.slug}>

                                        </TreeNode>
                                    })

                                }
                            </Tree>
                        </div>
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
                            <div style={{overflowY: 'auto', height: 'calc(100vh - 130px)' }}>
                                <div style={{padding:'15px 15px',height:'52px',borderBottom:'1px solid #D9D9D9'}}>
                                    <h2>{this.state.doc.title}</h2>
                                </div>
                                <div style={{ padding: '15px' }} dangerouslySetInnerHTML={{ __html: this.state.docHtml }} />
                            </div>
                        </div>
                    </Content>
                </Layout>
            </Layout>

        )
    }
}

export default Lake