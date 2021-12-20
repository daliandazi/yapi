import React, { PureComponent as Component } from 'react';
import _ from 'lodash'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Input, AutoComplete, Modal, List, Button, Empty } from 'antd';
import './Search.scss';
import { withRouter } from 'react-router-dom';
import { axios } from 'common/httpUtil';
import { setCurrGroup, fetchGroupMsg } from '../../../reducer/modules/group';
import { changeMenuItem } from '../../../reducer/modules/menu';
import { formatTime, safeArray } from "client/common.js";
import { fetchInterfaceListMenu } from '../../../reducer/modules/interface';
const Option = AutoComplete.Option;

@connect(
  state => ({
    groupList: state.group.groupList,
    projectList: state.project.projectList
  }),
  {
    setCurrGroup,
    changeMenuItem,
    fetchGroupMsg,
    fetchInterfaceListMenu
  }
)
@withRouter
export default class Srch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: [],
      keyWord: "",
      interfaceList: [],
    };
  }

  static propTypes = {
    groupList: PropTypes.array,
    projectList: PropTypes.array,
    router: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    setCurrGroup: PropTypes.func,
    changeMenuItem: PropTypes.func,
    fetchInterfaceListMenu: PropTypes.func,
    fetchGroupMsg: PropTypes.func
  };

  jump = async (projectId, id) => {
    await this.props.fetchInterfaceListMenu(projectId);
    this.props.history.push(
      '/project/' + projectId + '/interface/api/' + id
    );
    this.hide()
  }


  search() {
    this.setState({
      page: 1,
      limit: 10,
      hashMore: false
    }, this.query)
  }

  searchDebounce = _.debounce(this.search, 500)

  query = () => {
    if (!this.state.keyWord || this.state.keyWord.length == 0) {
      this.setState({
        interfaceList: [],
        total: 0,
        hasMore: false
      })
      return
    }
    this.setState({
      loading: true
    })
    axios.post("/api/search", {
      keyWord: this.state.keyWord,
      page: this.state.page || 1,
      limit: this.state.limit || 10
    }).then(response => {
      let before = this.state.interfaceList || []
      if (this.state.page > 1) {
        response.data.interfaceData.list.forEach(api => {
          before.push(api)
        })
      } else {
        before = response.data.interfaceData.list
      }
      this.setState({
        interfaceList: before,
        total: response.data.interfaceData.total,
        hasMore: response.data.interfaceData.hasMore
      })
      this.setState({
        loading: false
      })
    }).catch((error) => {
      this.setState({
        loading: false
      })
    })

  }

  hide = () => {
    this.setState({
      visible: false
    })
  }

  loadMore = () => {
    if (this.state.hasMore === true) {
      let page = this.state.page;
      page = page + 1
      this.setState({
        page: page
      }, this.query)
    }
  }

  // getDataSource(groupList){
  //   const groupArr =[];
  //   groupList.forEach(item =>{
  //     groupArr.push("group: "+ item["group_name"]);
  //   })
  //   return groupArr;
  // }

  render() {
    const { dataSource } = this.state;

    return (
      <div className="search-wrapper">
        <Modal
          closable={false}
          visible={this.state.visible}
          onCancel={() => {
            this.setState({
              visible: false
            })
          }}
          footer=""
          style={{ overflow: 'hidden' }}
        >
          <div>
            <Input placeholder="输入接口名字或者路径" value={this.state.keyWord} suffix={<Icon type="search"></Icon>} allowClear={true} onKeyDown={(e) => {
              if (e.keyCode == 13) {
                this.search()
              }
            }} onChange={(e) => {
              this.setState({
                keyWord: e.target.value
              }, () => {
                this.searchDebounce()
              })
            }}></Input>
          </div>
          <div style={{ height: '40px', lineHeight: '24px', marginTop: '10px' }}>
            搜索结果 数量 <span style={{ color: '#EF4444' }}>{this.state.total}</span>
          </div>
          {this.state.total && this.state.total > 0 ? (
            <div style={{ maxHeight: '500px', overflowY: 'auto', marginTop: '5px' }}>
              <List
                itemLayout="vertical"
                loading={this.state.loading}
                size="small"
                style={{ padding: '0 0 60px 10px', }}
                header={<div style={{ color: '#34D399', fontSize: '18px', fontWeight: '500' }}>API</div>}
              >
                {
                  this.state.interfaceList.map((api, index) => {
                    return <List.Item
                    >

                      <List.Item.Meta title={<div style={{ fontSize: '14px', cursor: 'pointer' }} onClick={() => {
                        this.jump(api.project_id, api._id)
                      }}><span style={{ color: '#8189A1',fontWeight:'700' }}>{index + 1}.</span> {api.title}</div>} description={
                        <span className='flex'><span>{api.path} </span> <span style={{ marginLeft: '20px' }}>修改时间:{formatTime(api.up_time)}</span></span>
                      }>

                      </List.Item.Meta>

                    </List.Item>
                  })
                }
              </List>
              <div style={{ textAlign: 'center', marginTop: '10px', position: 'absolute', bottom: '10px', left: '0px', backgroundColor: '#fff', width: '100%' }}>
                {
                  this.state.hasMore === true ? (
                    <Button type="link" onLoad={this.loading} onClick={this.loadMore}>加载更多...</Button>
                  ) : (
                    <span>没有更多了...</span>
                  )
                }

              </div>
            </div>
          ) : <Empty />}

        </Modal >
        <Icon className="search" style={{ fontSize: 16 }} type="search" onClick={() => {
          this.setState({
            visible: true
          })
        }} />
      </div >
    );
  }
}
