import React, { PureComponent as Component, useState, useRef, MutableRefObject, Dispatch, SetStateAction } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { Tabs, Layout, Menu, Icon } from 'antd';
import { Route, Switch, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';

const { Content, Sider } = Layout;

import './interface.scss';

import InterfaceMenu from './InterfaceList/InterfaceMenu.js';
import InterfaceList from './InterfaceList/InterfaceList.js';
import InterfaceContent from './InterfaceList/InterfaceContent.js';

import InterfaceColMenu from './InterfaceCol/InterfaceColMenu.js';
import InterfaceColContent from './InterfaceCol/InterfaceColContent.js';
import InterfaceCaseContent from './InterfaceCol/InterfaceCaseContent.js';
import { getProject } from '@reducer/modules/project';
import { setColData } from '@reducer/modules/interfaceCol.js';

const contentRouter = {
  path: '/project/:id/interface/:action/:actionId',
  exact: true
};

const { SubMenu } = Menu;
const headHeight = 80;

const InterfaceRoute = props => {
  let C;
  if (props.match.params.action === 'api') {
    if (!props.match.params.actionId) {
      C = InterfaceList;
    } else if (!isNaN(props.match.params.actionId)) {
      C = InterfaceContent;
    } else if (props.match.params.actionId.indexOf('cat_') === 0) {
      C = InterfaceList;
    }
  }
  //  else {
  //   C = InterfaceContent;
  // }
  return <C {...props} />;
};

InterfaceRoute.propTypes = {
  match: PropTypes.object
};

@connect(
  state => {
    return {
      isShowCol: state.interfaceCol.isShowCol
    };
  },
  {
    setColData,
    getProject
  }
)
class Interface extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    isShowCol: PropTypes.bool,
    getProject: PropTypes.func,
    setColData: PropTypes.func
    // fetchInterfaceColList: PropTypes.func
  };

  state = {
    interfaceSider: null,
    beforeWidth: 0,
    mouseY: 0,
    mouseX: 0,
    dragDom: null
  }

  constructor(props) {
    super(props);
    // this.state = {
    //   curkey: this.props.match.params.action === 'api' ? 'api' : 'colOrCase'
    // }
  }

  onChange = action => {
    let params = this.props.match.params;
    if (action === 'colOrCase') {
      action = this.props.isShowCol ? 'col' : 'case';
    }
    this.props.history.push('/project/' + params.id + '/interface/' + action);
  };
  async componentWillMount() {
    this.props.setColData({
      isShowCol: true
    });
    // await this.props.fetchInterfaceColList(this.props.match.params.id)
  }

  drag = (e) => {
    document.documentElement.addEventListener('mousemove', this.handleMouseMove);
    document.documentElement.addEventListener('mouseup', this.handleMouseUp);
    e.preventDefault();

    let beforeWidth = e.currentTarget.previousElementSibling.clientWidth;
    let interfaceSider = ReactDOM.findDOMNode(this.state.interfaceSider);

    this.setState({
      beforeWidth: beforeWidth,
      dragDom: interfaceSider,
      mouseX: e.clientX
    })


    // let interfaceSider = ReactDOM.findDOMNode(this.state.interfaceSider);
    // interfaceSider.style.flex = "0 0 200px"
    // interfaceSider.style.width = '200px'
    // interfaceSider.style.minWidth = '200px'
    // console.log(interfaceSider.style)
  }

  handleMouseMove = (e) => {

    // 移动的距离
    let spaceW = e.clientX - this.state.mouseX;

    // 计算移动后的宽度
    let w = this.state.beforeWidth + spaceW;
    if (w < 1) {
      return
    }
    if (this.state.beforeWidth == w) {
      return
    }

    // console.log(`spaceW=%s , w=%s `, spaceW, w)
    let dragDom = this.state.dragDom

    dragDom.style.width = w + "px";
    dragDom.style.minWidth = w + "px";
    dragDom.style.flex = "0 0 " + w + "px";

    this.setState({
      mouseX: e.clientX,
      beforeWidth: w
    })

  }
  handleMouseUp = (e) => {
    document.documentElement.removeEventListener('mousemove', this.handleMouseMove);
    document.documentElement.removeEventListener('mouseup', this.handleMouseUp);
  }

  interfaceSiderFun = p => {
    this.setState({
      interfaceSider: p
    })
  }

  DragSider = () => {
    return (
      <div>
        ddd
      </div>
    )
  }

  render() {
    const { action } = this.props.match.params;
    // const activeKey = this.state.curkey;
    const activeKey = action === 'api' ? 'api' : 'colOrCase';

    // 实现元素左右拖拽的Hook逻辑
    function useLeft2Right(
      resizeLine,
      setNavWidth
    ) {
      useEffect(() => {
        let { current } = resizeLine;

        let mouseDown = (e) => {
          let resize = throttle(function (e) {
            if (e.clientX > 150 && e.clientX < window.innerWidth * 0.8) {
              setNavWidth(e.clientX);
            }
          }, 100);

          let resizeUp = function () {
            document.removeEventListener("mousemove", resize);
            document.removeEventListener("mouseup", resizeUp);
          }

          document.addEventListener("mousemove", resize);
          document.addEventListener("mouseup", resizeUp)
        }

        current.addEventListener("mousedown", mouseDown);

        return function () {
          current.removeEventListener("mousedown", mouseDown);
        }
      }, []);
    }

    function DragSider(props) {
      console.log(props)

      let { children } = props;
      let [navWidth, setNavWidth] = useState(200);
      let resizeLine = useRef(null);

      useLeft2Right(resizeLine, setNavWidth);

      let asideStyle = {
        width: navWidth,
      };

      let resizeLineStyle = {
        position: "absolute",
        right: 0,
        top: 0,
        zIndex: 100,
        width: 3,
        height: "100%",
        backgroundColor: "white",
        cursor: "w-resize"
      };


      return (
        <Sider style={{ height: '100%', overflow: 'hidden', borderLeft: '1px solid #D9D9D9', border: '1px solid #D9D9D9', borderRight: '0px' }} ref={this.interfaceSiderFun} id={'interface-sider'} width={300}>
          {children}
          <div className="layout-split" ref={resizeLine}>
          </div>
        </Sider>
      )
    }

    return (
      <Layout style={{ height: 'calc(100vh - 80px)' }}>
        <Sider style={{ height: '100%', overflow: 'hidden', borderLeft: '1px solid #D9D9D9', border: '1px solid #D9D9D9', borderRight: '0px' }} ref={this.interfaceSiderFun} id={'interface-sider'} width={300}>
          <div className="left-menu" style={{ height: parseInt(document.body.clientHeight) - headHeight + 'px' }}>
            <InterfaceMenu
              router={matchPath(this.props.location.pathname, contentRouter)}
              projectId={this.props.match.params.id}
            />
          </div>
          <div className="layout-split" onMouseDown={this.drag}></div>
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
            <div className="right-content">
              <Switch>
                <Route exact path="/project/:id/interface/:action" component={InterfaceRoute} />
                <Route {...contentRouter} component={InterfaceRoute} />
              </Switch>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default Interface;
