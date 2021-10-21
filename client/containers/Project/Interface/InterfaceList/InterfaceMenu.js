import React, { PureComponent as Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  fetchInterfaceListMenu,
  fetchInterfaceList,
  fetchInterfaceCatList,
  fetchInterfaceData,
  deleteInterfaceData,
  deleteInterfaceCatData,
  initInterface
} from '../../../../reducer/modules/interface.js';
import { getProject } from '../../../../reducer/modules/project.js';
import { Input, Icon, Button, Modal, message, Tree, Tooltip, Menu, Popover, Divider, Tag } from 'antd';
import AddInterfaceForm from './AddInterfaceForm';
import AddInterfaceCatForm from './AddInterfaceCatForm';
import AddForkDocForm from './AddForkDocForm'
import axios from 'axios';
import { Link, withRouter } from 'react-router-dom';
import produce from 'immer';
import { arrayChangeIndex } from '../../../../common.js';
import variable from 'client/constants/variable';

import './interfaceMenu.scss';

const confirm = Modal.confirm;
const TreeNode = Tree.TreeNode;
const headHeight = 240; // menu顶部到网页顶部部分的高度

@connect(
  state => {
    return {
      list: state.inter.list,
      inter: state.inter.curdata,
      curProject: state.project.currProject,
      expands: []
    };
  },
  {
    fetchInterfaceListMenu,
    fetchInterfaceData,
    deleteInterfaceCatData,
    deleteInterfaceData,
    initInterface,
    getProject,
    fetchInterfaceCatList,
    fetchInterfaceList
  }
)
class InterfaceMenu extends Component {
  static propTypes = {
    match: PropTypes.object,
    inter: PropTypes.object,
    projectId: PropTypes.string,
    list: PropTypes.array,
    fetchInterfaceListMenu: PropTypes.func,
    curProject: PropTypes.object,
    fetchInterfaceData: PropTypes.func,
    addInterfaceData: PropTypes.func,
    deleteInterfaceData: PropTypes.func,
    initInterface: PropTypes.func,
    history: PropTypes.object,
    router: PropTypes.object,
    getProject: PropTypes.func,
    fetchInterfaceCatList: PropTypes.func,
    fetchInterfaceList: PropTypes.func
  };

  /**
   * @param {String} key
   */
  changeModal = (key, status) => {
    //visible add_cat_modal_visible change_cat_modal_visible del_cat_modal_visible
    let newState = {};
    newState[key] = status;
    this.setState(newState);
  };

  handleCancel = () => {
    this.setState({
      visible: false
    });
  };

  constructor(props) {
    super(props);
    this.state = {
      curKey: null,
      visible: false,
      delIcon: null,
      curCatid: null,
      add_cat_modal_visible: false,
      change_cat_modal_visible: false,
      del_cat_modal_visible: false,
      change_cat_modal_visible: false,
      curCatdata: {},
      expands: null,
      list: []
    };
  }

  handleRequest() {
    this.props.initInterface();
    this.getList();
  }

  async getList() {
    let r = await this.props.fetchInterfaceListMenu(this.props.projectId);
    this.setState({
      list: r.payload.data.data
    });
  }

  componentWillMount() {
    this.handleRequest();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.list !== nextProps.list) {
      // console.log('next', nextProps.list)
      this.setState({
        list: nextProps.list
      });
    }
  }

  onSelect = selectedKeys => {
    console.log(selectedKeys)
    // return null;
    const { history, match } = this.props;
    let curkey = selectedKeys[0];

    if (!curkey || !selectedKeys) {
      return false;
    }
    let basepath = '/project/' + match.params.id + '/interface/api';
    if (curkey === 'root') {
      history.push(basepath);
    } else {
      history.push(basepath + '/' + curkey);
    }
    console.log(this.state.expands)
    // this.setState({
    //   expands: null
    // });
  };

  changeExpands = () => {
    return
    this.setState({
      expands: null
    });
  };

  handleAddInterface = (data, cb) => {
    data.project_id = this.props.projectId;
    axios.post('/api/interface/add', data).then(res => {
      if (res.data.errcode !== 0) {
        return message.error(res.data.errmsg);
      }
      message.success('接口添加成功');
      let interfaceId = res.data.data._id;
      this.props.history.push('/project/' + this.props.projectId + '/interface/api/' + interfaceId);
      this.getList();
      this.setState({
        visible: false
      });
      if (cb) {
        cb();
      }
    });
  };

  handleAddInterfaceCat = data => {
    data.project_id = this.props.projectId;
    data.parent_id = this.state.curCatdata.addchild ? this.state.curCatdata._id : -1;
    axios.post('/api/interface/add_cat', data).then(res => {
      if (res.data.errcode !== 0) {
        return message.error(res.data.errmsg);
      }
      message.success('接口分组添加成功');
      this.getList();
      this.props.getProject(data.project_id);
      this.setState({
        add_cat_modal_visible: false
      });
    });
  };

  handleChangeInterfaceCat = data => {
    data.project_id = this.props.projectId;

    let params = {
      catid: this.state.curCatdata._id,
      name: data.name,
      desc: data.desc
    };

    axios.post('/api/interface/up_cat', params).then(res => {
      if (res.data.errcode !== 0) {
        return message.error(res.data.errmsg);
      }
      message.success('接口分组更新成功');
      this.getList();
      this.props.getProject(data.project_id);
      this.setState({
        change_cat_modal_visible: false
      });
    });
  };

  showConfirm = data => {
    let that = this;
    let id = data._id;
    let catid = data.catid;
    const ref = confirm({
      title: '您确认删除此接口????',
      content: '温馨提示：接口删除后，无法恢复',
      okText: '确认',
      cancelText: '取消',
      async onOk() {
        await that.props.deleteInterfaceData(id, that.props.projectId);
        await that.getList();
        await that.props.fetchInterfaceCatList({ catid });
        ref.destroy();
        that.props.history.push(
          '/project/' + that.props.match.params.id + '/interface/api/cat_' + catid
        );
      },
      onCancel() {
        ref.destroy();
      }
    });
  };

  showDelCatConfirm = catid => {
    let that = this;
    const ref = confirm({
      title: '确定删除此接口分组吗？',
      content: '温馨提示：该操作会删除该分组下所有接口，接口删除后无法恢复',
      okText: '确认',
      cancelText: '取消',
      async onOk() {
        await that.props.deleteInterfaceCatData(catid, that.props.projectId);
        await that.getList();
        // await that.props.getProject(that.props.projectId)
        await that.props.fetchInterfaceList({ project_id: that.props.projectId });
        that.props.history.push('/project/' + that.props.match.params.id + '/interface/api');
        ref.destroy();
      },
      onCancel() { }
    });
  };

  copyInterface = async id => {
    let interfaceData = await this.props.fetchInterfaceData(id);
    // let data = JSON.parse(JSON.stringify(interfaceData.payload.data.data));
    // data.title = data.title + '_copy';
    // data.path = data.path + '_' + Date.now();
    let data = interfaceData.payload.data.data;
    let newData = produce(data, draftData => {
      draftData.title = draftData.title + '_copy';
      draftData.path = draftData.path + '_' + Date.now();
    });

    axios.post('/api/interface/add', newData).then(async res => {
      if (res.data.errcode !== 0) {
        return message.error(res.data.errmsg);
      }
      message.success('接口添加成功');
      let interfaceId = res.data.data._id;
      await this.getList();
      this.props.history.push('/project/' + this.props.projectId + '/interface/api/' + interfaceId);
      this.setState({
        visible: false
      });
    });
  };

  enterItem = id => {
    this.setState({ delIcon: id });
  };

  leaveItem = () => {
    this.setState({ delIcon: null });
  };

  onFilter = e => {
    this.setState({
      filter: e.target.value,
      list: JSON.parse(JSON.stringify(this.props.list))
    });
  };

  onExpand = e => {
    this.setState({
      expands: e
    });
  };

  onDrop = async e => {
    const dropCatIndex = e.node.props.pos.split('-')[1] - 1;
    const dragCatIndex = e.dragNode.props.pos.split('-')[1] - 1;
    if (dropCatIndex < 0 || dragCatIndex < 0) {
      return;
    }
    const { list } = this.props;
    const dropCatId = this.props.list[dropCatIndex]._id;
    const id = e.dragNode.props.eventKey;
    const dragCatId = this.props.list[dragCatIndex]._id;

    const dropPos = e.node.props.pos.split('-');
    const dropIndex = Number(dropPos[dropPos.length - 1]);
    const dragPos = e.dragNode.props.pos.split('-');
    const dragIndex = Number(dragPos[dragPos.length - 1]);

    if (id.indexOf('cat') === -1) {
      if (dropCatId === dragCatId) {
        // 同一个分类下的接口交换顺序
        let colList = list[dropCatIndex].list;
        let changes = arrayChangeIndex(colList, dragIndex, dropIndex);
        axios.post('/api/interface/up_index', changes).then();
      } else {
        await axios.post('/api/interface/up', { id, catid: dropCatId });
      }
      const { projectId, router } = this.props;
      this.props.fetchInterfaceListMenu(projectId);
      this.props.fetchInterfaceList({ project_id: projectId });
      if (router && isNaN(router.params.actionId)) {
        // 更新分类list下的数据
        let catid = router.params.actionId.substr(4);
        this.props.fetchInterfaceCatList({ catid });
      }
    } else {
      // 分类之间拖动
      let changes = arrayChangeIndex(list, dragIndex - 1, dropIndex - 1);
      axios.post('/api/interface/up_cat_index', changes).then();
      this.props.fetchInterfaceListMenu(this.props.projectId);
    }
  };
  // 数据过滤
  filterList = list => {
    let that = this;
    let arr = [];
    let menuList = produce(list, draftList => {
      draftList.filter(item => {
        let interfaceFilter = false;
        // arr = [];
        if (item.name.indexOf(that.state.filter) === -1) {
          item.list = item.list.filter(inter => {
            if (
              inter.title.indexOf(that.state.filter) === -1 &&
              inter.path.indexOf(that.state.filter) === -1
            ) {
              return false;
            }
            //arr.push('cat_' + inter.catid)
            interfaceFilter = true;
            return true;
          });
          arr.push('cat_' + item._id);
          return interfaceFilter === true;
        }
        arr.push('cat_' + item._id);
        return true;
      });
    });

    return { menuList, arr };
  };

  render() {
    const matchParams = this.props.match.params;
    // let menuList = this.state.list;
    const searchBox = (
      <div className="interface-filter">
        <div>
          <div style={{ maxHeight: '54px', padding: '8px 10px' }}>
            <Button
              icon="plus"
              type="primary"
              onClick={() => this.changeModal('add_cat_modal_visible', true)}
              className="btn-filter"
            >
              添加分组
            </Button>
          </div>
          <div style={{ borderTop: '1px solid #D9D9D9', borderBottom: '1px solid #D9D9D9', padding: '6px 10px' }}>
            <Input style={{ width: '100%' }} onChange={this.onFilter} value={this.state.filter} placeholder="搜索接口" />
          </div>
        </div>

        {this.state.visible ? (
          <Modal
            title="添加接口"
            visible={this.state.visible}
            onCancel={() => this.changeModal('visible', false)}
            footer={null}
            className="addcatmodal"
          >
            <AddInterfaceForm
              catdata={this.props.curProject.cat}
              catid={this.state.curCatid}
              onCancel={() => this.changeModal('visible', false)}
              onSubmit={this.handleAddInterface}
            />
          </Modal>
        ) : (
          ''
        )}

        {this.state.add_cat_modal_visible ? (
          <Modal
            title={
              this.state.curCatdata.addchild ? "在【" + this.state.curCatdata.name + "】下添加子分组" : "添加主分组"
            }
            visible={this.state.add_cat_modal_visible}
            onCancel={() => this.changeModal('add_cat_modal_visible', false)}
            footer={null}
            className="addcatmodal"
          >
            <AddInterfaceCatForm
              catdata={this.state.curCatdata.addchild ? {} : this.state.curCatdata}
              onCancel={() => this.changeModal('add_cat_modal_visible', false)}
              onSubmit={this.handleAddInterfaceCat}
            />
          </Modal>
        ) : (
          ''
        )}


        {this.state.add_cat_modal_visible ? (
          <Modal
            title="添加分组"
            visible={this.state.add_cat_modal_visible}
            onCancel={() => this.changeModal('add_cat_modal_visible', false)}
            footer={null}
            className="addcatmodal"
          >
            <AddInterfaceCatForm
              onCancel={() => this.changeModal('add_cat_modal_visible', false)}
              onSubmit={this.handleAddInterfaceCat}
            />
          </Modal>
        ) : (
          ''
        )}

        {this.state.change_cat_modal_visible ? (
          <Modal
            title="修改分组"
            visible={this.state.change_cat_modal_visible}
            onCancel={() => this.changeModal('change_cat_modal_visible', false)}
            footer={null}
            className="addcatmodal"
          >
            <AddInterfaceCatForm
              catdata={this.state.curCatdata}
              onCancel={() => this.changeModal('change_cat_modal_visible', false)}
              onSubmit={this.handleChangeInterfaceCat}
            />
          </Modal>
        ) : (
          ''
        )}

        {this.state.add_fork_modal_visible ? (

          <AddForkDocForm
            visible={this.state.add_fork_modal_visible}
            catdata={this.state.curCatdata}
            onCancel={() => this.changeModal('add_fork_modal_visible', false)}
            onSubmit={(data) => {
              console.log(data)
              if (data && data.length > 0) {
                console.log(this.state.curCatdata)
                console.log(this.state.curCatid)

                for (let i in data) {
                  let d = data[i];

                  if (d.cat === true) {

                  } else {
                    let api = {
                      "catid": this.state.curCatid,
                      "project_id": this.props.projectId,
                      "type": "ref",
                      "ref_id": d.key
                    }
                    console.log(api)
                    axios.post('/api/interface/add', api).then(res => {
                      if (res.data.errcode !== 0) {
                        return message.error(`${res.data.errmsg}, 关联接口出现异常`);
                      }
                    });
                  }
                }

                this.getList();
              }
              this.changeModal('add_fork_modal_visible', false)
            }}
          />
        ) : ('')

        }

      </div>
    );
    const defaultExpandedKeys = () => {
      const { router, inter, list } = this.props,
        rNull = { expands: [], selects: [] };
      if (list.length === 0) {
        return rNull;
      }
      if (router) {
        if (!isNaN(router.params.actionId)) {
          if (!inter || !inter._id) {
            return rNull;
          }
          return {
            expands: this.state.expands ? this.state.expands : ['cat_' + inter.catid],
            selects: [inter._id + '']
          };
        } else {
          let catid = router.params.actionId.substr(4);
          return {
            expands: this.state.expands ? this.state.expands : ['cat_' + catid],
            selects: ['cat_' + catid]
          };
        }
      } else {
        return {
          expands: this.state.expands ? this.state.expands : ['cat_' + list[0]._id],
          selects: ['root']
        };
      }
    };


    const itemCatCreate = item => {
      return (
        <TreeNode
          title={
            <div
              className="container-title"
              onMouseEnter={() => this.enterItem(item._id)}
              onMouseLeave={this.leaveItem}
            >
              <Link
                className="interface-item"
                to={'/project/' + matchParams.id + '/interface/api/cat_' + item._id}
              >
                <Icon type="folder-open" style={{ marginRight: 5 }} />
                {item.title}
              </Link>
              <div className="btns">
                <Popover
                  placement="leftTop"
                  content={
                    <div className="IM-menu">
                      <div>
                        <span
                          onClick={e => {
                            e.stopPropagation();
                            this.changeModal('visible', true);
                            this.setState({
                              curCatid: item._id
                            });
                          }}

                        ><Icon type="plus" /> 新增接口</span>
                      </div>

                      <div
                        onClick={e => {
                          e.stopPropagation();
                          this.changeModal('add_fork_modal_visible', true);
                          this.setState({
                            curCatid: item._id,
                            curCatdata: item
                          });
                        }}
                      >
                        <span><Icon type="fork" /> 关联接口</span>
                      </div>

                      <div>
                        <span
                          onClick={e => {
                            e.stopPropagation();
                            this.changeModal('add_cat_modal_visible', true);
                            item['addchild'] = true;
                            this.setState({
                              curCatdata: item
                            });
                          }}
                        ><Icon type="plus" /> 添加分组</span>
                      </div>

                      <div>
                        <span
                          onClick={e => {
                            e.stopPropagation();
                            this.changeModal('change_cat_modal_visible', true);
                            this.setState({
                              curCatdata: item
                            });
                          }}
                        ><Icon type="edit" /> 编辑分组</span>
                      </div>
                      <div>
                        <span
                          onClick={e => {
                            e.stopPropagation();
                            this.showDelCatConfirm(item._id);
                          }}
                        ><Icon type="delete" /> 删除分组</span>
                      </div>
                    </div>
                  }
                >
                  <Icon
                    type="ellipsis"
                    className="interface-delete-icon"
                    style={{ display: this.state.delIcon == item._id ? 'block' : 'none' }}
                  />
                </Popover>
                {/* <Tooltip title="删除分组">
                  <Icon
                    type="delete"
                    className="interface-delete-icon"
                    onClick={e => {
                      e.stopPropagation();
                      this.showDelCatConfirm(item._id);
                    }}
                    style={{ display: this.state.delIcon == item._id ? 'block' : 'none' }}
                  />
                </Tooltip>
                <Tooltip title="添加子分组">
                  <Icon
                    type="plus"
                    className="interface-delete-icon"
                    style={{ display: this.state.delIcon == item._id ? 'block' : 'none' }}
                    onClick={e => {
                      e.stopPropagation();
                      this.changeModal('add_cat_modal_visible', true);
                      item['addchild'] = true;
                      this.setState({
                        curCatdata: item
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title="修改分组">
                  <Icon
                    type="edit"
                    className="interface-delete-icon"
                    style={{ display: this.state.delIcon == item._id ? 'block' : 'none' }}
                    onClick={e => {
                      e.stopPropagation();
                      this.changeModal('change_cat_modal_visible', true);
                      // item.addchild=false;
                      this.setState({
                        curCatdata: item
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title="添加接口">
                  <Icon
                    type="plus"
                    className="interface-delete-icon"
                    style={{ display: this.state.delIcon == item._id ? 'block' : 'none' }}
                    onClick={e => {
                      e.stopPropagation();
                      this.changeModal('visible', true);
                      this.setState({
                        curCatid: item._id
                      });
                    }}
                  />
                </Tooltip> */}
              </div>

              {/*<Dropdown overlay={menu(item)} trigger={['click']} onClick={e => e.stopPropagation()}>
                <Icon type='ellipsis' className="interface-delete-icon" />
              </Dropdown>*/}
            </div>
          }
          key={'cat_' + item._id}
        >
          {item.children ? item.children.filter(me => (me.in === true || typeof me.in === "undefined")).map(itemCatCreate) : ''}
          {item.list.map(itemInterfaceCreate)}
        </TreeNode>
      )

    };

    const methodTag = (method) => {
      // if (method == 'POST') {
      //   return <Tag color="blue">{method}</Tag>
      // } else {
      //   return <Tag color="cyan">{method}</Tag>
      // }
      let methodColor =
        variable.METHOD_COLOR[method ? method.toLowerCase() : 'get'] ||
        variable.METHOD_COLOR['get'];

      return <span
        style={{ color: methodColor.color, backgroundColor: methodColor.bac }}
        className="TreeColValue"
      >
        {method}
      </span>

    }

    const itemInterfaceCreate = item => {
      return (
        <TreeNode
          title={
            <div
              className="container-title"
              onMouseEnter={() => this.enterItem(item._id)}
              onMouseLeave={this.leaveItem}
            >
              <Link
                className="interface-item"
                onClick={e => e.stopPropagation()}
                to={'/project/' + matchParams.id + '/interface/api/' + item._id}
              >
                {methodTag(item.method)} {item.title}
              </Link>
              <div className="btns">
                <Tooltip title="删除接口">
                  <Icon
                    type="delete"
                    className="interface-delete-icon"
                    onClick={e => {
                      e.stopPropagation();
                      this.showConfirm(item);
                    }}
                    style={{ display: this.state.delIcon == item._id ? 'block' : 'none' }}
                  />
                </Tooltip>
                <Tooltip title="复制接口">
                  <Icon
                    type="copy"
                    className="interface-delete-icon"
                    onClick={e => {
                      e.stopPropagation();
                      this.copyInterface(item._id);
                    }}
                    style={{ display: this.state.delIcon == item._id ? 'block' : 'none' }}
                  />
                </Tooltip>
              </div>
              {/*<Dropdown overlay={menu(item)} trigger={['click']} onClick={e => e.stopPropagation()}>
            <Icon type='ellipsis' className="interface-delete-icon" style={{ opacity: this.state.delIcon == item._id ? 1 : 0 }}/>
          </Dropdown>*/}
            </div>
          }
          key={'' + item._id}
        />
      );
    };

    let currentKes = defaultExpandedKeys();
    let menuList;
    if (this.state.filter) {
      let res = this.filterList(this.state.list);
      menuList = res.menuList;
      currentKes.expands = res.arr;
    } else {
      menuList = this.state.list;
    }

    let content = () => {
      return (
        <div className="IM-menu">
          <div>
            <span><Icon type="plus" /> 新增接口</span>
          </div>
          <div>
            <span><Icon type="fork" /> 关联接口</span>
          </div>
          <div>
            <span><Icon type="edit" /> 编辑分组</span>
          </div>
          <div>
            <span><Icon type="delete" /> 删除分组</span>
          </div>
        </div>
      )
    }

    return (
      <div>
        {searchBox}
        {menuList.length > 0 ? (
          <div
            className="tree-wrappper"
          >
            <Menu
              mode="inline"
            >
              <Menu.Item
                className="item"
                style={{ borderBottom: '1px dashed #D9D9D9' }}
              >
                <Link
                  onClick={e => {
                    e.stopPropagation();
                    this.changeExpands();
                  }}
                  to={'/project/' + matchParams.id + '/interface/api'}
                >
                  <Icon type="menu" style={{ marginRight: 5 }} />
                  所有API
                </Link>
              </Menu.Item>
            </Menu>
            <Tree
              blockNode
              className="interface-list"
              defaultExpandedKeys={currentKes.expands}
              defaultSelectedKeys={currentKes.selects}
              expandedKeys={currentKes.expands}
              selectedKeys={currentKes.selects}
              onSelect={this.onSelect}
              onExpand={this.onExpand}
              draggable
              onDrop={this.onDrop}
              switcherIcon={<Icon type="down" />}
            >
              {menuList.map(item => {
                return (
                  <TreeNode
                    title={
                      <div
                        className="container-title"
                        onMouseEnter={() => this.enterItem(item._id)}
                        onMouseLeave={this.leaveItem}
                      >
                        <Link
                          className="interface-item"
                          onClick={e => {
                            e.stopPropagation();
                            this.changeExpands();
                          }}
                          to={'/project/' + matchParams.id + '/interface/api/cat_' + item._id}
                        >
                          <Icon type="folder-open" style={{ marginRight: 5 }} />
                          {item.name}
                        </Link>
                        <div className="btns">
                          <Popover
                            placement="leftTop"
                            content={
                              <div className="IM-menu">
                                <div>
                                  <span
                                    onClick={e => {
                                      e.stopPropagation();
                                      this.changeModal('visible', true);
                                      this.setState({
                                        curCatid: item._id
                                      });
                                    }}

                                  ><Icon type="plus" /> 新增接口</span>
                                </div>

                                <div
                                  onClick={e => {
                                    e.stopPropagation();
                                    this.changeModal('add_fork_modal_visible', true);
                                    this.setState({
                                      curCatid: item._id
                                    });
                                  }}
                                >
                                  <span><Icon type="fork" /> 关联接口</span>
                                </div>

                                <div>
                                  <span
                                    onClick={e => {
                                      e.stopPropagation();
                                      this.changeModal('add_cat_modal_visible', true);
                                      item['addchild'] = true;
                                      this.setState({
                                        curCatdata: item
                                      });
                                    }}
                                  ><Icon type="plus" /> 添加分组</span>
                                </div>

                                <div>
                                  <span
                                    onClick={e => {
                                      e.stopPropagation();
                                      this.changeModal('change_cat_modal_visible', true);
                                      this.setState({
                                        curCatdata: item
                                      });
                                    }}
                                  ><Icon type="edit" /> 编辑分组</span>
                                </div>
                                <div>
                                  <span
                                    onClick={e => {
                                      e.stopPropagation();
                                      this.showDelCatConfirm(item._id);
                                    }}
                                  ><Icon type="delete" /> 删除分组</span>
                                </div>
                              </div>
                            }
                          >
                            <Icon
                              type="ellipsis"
                              className="interface-delete-icon"
                              style={{ display: this.state.delIcon == item._id ? 'block' : 'none' }}
                            />
                          </Popover>

                          {/* <Tooltip title="删除分组">
                            <Icon
                              type="delete"
                              className="interface-delete-icon"
                              onClick={e => {
                                e.stopPropagation();
                                this.showDelCatConfirm(item._id);
                              }}
                              style={{ display: this.state.delIcon == item._id ? 'block' : 'none' }}
                              onClick={(e) => {
                                e.preventDefault();
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="添加子分组">
                            <Icon
                              type="plus"
                              className="interface-delete-icon"
                              style={{ display: this.state.delIcon == item._id ? 'block' : 'none' }}
                              onClick={e => {
                                e.stopPropagation();
                                this.changeModal('add_cat_modal_visible', true);
                                item['addchild'] = true;
                                this.setState({
                                  curCatdata: item
                                });
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="修改分组">
                            <Icon
                              type="edit"
                              className="interface-delete-icon"
                              style={{ display: this.state.delIcon == item._id ? 'block' : 'none' }}
                              onClick={e => {
                                e.stopPropagation();
                                this.changeModal('change_cat_modal_visible', true);
                                this.setState({
                                  curCatdata: item
                                });
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="添加接口">
                            <Icon
                              type="plus"
                              className="interface-delete-icon"
                              style={{ display: this.state.delIcon == item._id ? 'block' : 'none' }}
                              onClick={e => {
                                e.stopPropagation();
                                this.changeModal('visible', true);
                                this.setState({
                                  curCatid: item._id
                                });
                              }}
                            />
                          </Tooltip>
                          <Tooltip title="关联接口">
                            <Icon
                              type="fork"
                              className="interface-delete-icon"
                              style={{ display: this.state.delIcon == item._id ? 'block' : 'none' }}
                              onClick={e => {
                                e.stopPropagation();
                                this.changeModal('add_fork_modal_visible', true);
                                this.setState({
                                  curCatid: item._id
                                });
                              }}
                            />
                          </Tooltip> */}
                        </div>
                      </div>
                    }
                    key={'cat_' + item._id}
                    className={`interface-item-nav ${item.list.length ? '' : 'cat_switch_hidden'}`}
                  >
                    {item.children ? item.children.filter(me => (me.in === true || typeof me.in === "undefined")).map(itemCatCreate) : ''}
                    {item.list.map(itemInterfaceCreate)}
                  </TreeNode>
                );
              })}
            </Tree>
          </div>
        ) : null}
      </div>
    );
  }
}

export default withRouter(InterfaceMenu);
