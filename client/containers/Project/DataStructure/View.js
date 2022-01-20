import React, { PureComponent as Component } from "react";
import PropTypes from "prop-types";
import {
    Icon,
    Button,
    Modal,
    Divider
} from "antd";
import AceEditor from "client/components/AceEditor/AceEditor";
import { connect } from "react-redux";
import { axios } from "common/httpUtil";
import Edit from './Edit'
const confirm = Modal.confirm;

@connect((state) => {
    return {
        statusCodeGroupList: [],
    };
})
class StatusCode extends Component {
    static propTypes = {
        match: PropTypes.object,
        history: PropTypes.object,
        projectId: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {
            add_code_modal_visible: false,
            dataStructureId: null,
            data: null
        };
    }

    async queryGroupList() {
        // axios
        //     .get("/api/dataStructure/group/list?projectId=" + this.props.match.params.id)
        //     .then((response) => {
        //         this.setState({
        //             statusCodeGroupList: response.data,
        //         });
        //     });
    }

    async selectedGroup(groupId) {
        // if (!groupId || groupId.length == 0) {
        //     return;
        // }
        // this.props.history.push(
        //     "/project/" +
        //     this.props.match.params.id +
        //     "/dataStructure/list/" +
        //     groupId[0]
        // );
    }

    loadData(id) {
        axios.get('/api/dataStructure/getById', {
            params: {
                id: id || this.state.dataStructureId
            }
        }).then(response => {
            if (response.data) {
                if (response.data.structure) {
                    // response.data.structure = checkIsJsonSchema(response.data.structure)
                }
            }
            this.setState({
                data: response.data
            })
        })
    }

    leaveItem = () => {
        this.setState({ delIcon: null });
    };

    showEdit() {
        this.setState({
            add_code_modal_visible: true
        })
    }

    async componentDidMount() {
        let dataStructureId = this.props.match.params.dataStructureId;
        this.setState({
            dataStructureId: dataStructureId
        })
        this.loadData(dataStructureId);
    }

    componentWillReceiveProps(nextProps) {
        let dataStructureId = nextProps.match.params.dataStructureId;
        this.setState({
            dataStructureId: dataStructureId
        })
        this.loadData(dataStructureId);
    }

    render() {
        return (
            <div style={{ padding: '20px 15px', lineHeight: '30px' }}>
                {this.state.add_code_modal_visible === true ? (
                    <Edit
                        id={this.state.dataStructureId}
                        visible={this.state.add_code_modal_visible} projectId={this.state.projectId}
                        onSubmit={() => {
                            this.setState({
                                add_code_modal_visible: false,
                            })
                            this.loadData()
                        }
                        }
                        onCancel={() => {
                            this.setState({
                                add_code_modal_visible: false,
                            })
                        }
                        }
                        groupId={this.state.selectedGroupId}
                    />
                ) : ""
                }

                {
                    this.state.data ? (
                        <div>
                            <div style={{ position: 'absolute', right: '20px' }}><Icon type="edit" style={{ cursor: 'pointer' }} onClick={this.showEdit.bind(this)}></Icon></div>
                            <div>
                                <div style={{ color: '#000', fontSize: '22px', lineHeight: '22px', fontWeight: '700' }}>{this.state.data.name}</div>
                                <div><span style={{ color: 'rgb(0 0 0 / 65%)' }}>模板编号:  {this.state.data.code}</span></div>
                            </div>
                            <div>
                                <span style={{ color: 'rgb(0 0 0 / 65%)' }}>模板描述:  </span><span>{this.state.data.description}</span>
                            </div>
                            <Divider />
                            <div style={{ fontWeight: '500', color: '#000', marginTop: '10px' }}>
                                结构
                            </div>
                            <div style={{ marginTop: '10px', borderRadius: '4px', overflow: 'hidden', }}>
                                <AceEditor
                                    data={this.state.data ? this.state.data.structure_json : ""}
                                    readOnly={true}
                                    style={{ minHeight: 200 }}
                                />
                            </div>
                        </div>) : (<div>没有数据</div>)
                }
            </div>
        );
    }
}

export default StatusCode;
