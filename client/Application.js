import React, { PureComponent as Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import { Index, Group, Project, AddProject, Login,Follow } from './containers/index';
import User from './containers/User/User.js';
import Header from './components/Header/Header';
import Loading from './components/Loading/Loading';
import MyPopConfirm from './components/MyPopConfirm/MyPopConfirm';
import { checkLoginState } from './reducer/modules/user';
import { requireAuthentication } from './components/AuthenticatedComponent';
import Notify from './components/Notify/Notify';

const plugin = require('client/plugin.js');

const LOADING_STATUS = 0;

let AppRoute = {
  home: {
    path: '/',
    component: Index
  },
  group: {
    path: '/space',
    component: Group
  },
  project: {
    path: '/project/:id',
    component: Project
  },
  user: {
    path: '/user',
    component: User
  },
  follow: {
    path: '/follow',
    component: Follow
  },
  addProject: {
    path: '/add-project',
    component: AddProject
  },
  login: {
    path: '/login',
    component: Login
  }
};
// 增加路由钩子
plugin.emitHook('app_route', AppRoute);

@connect(
  state => {
    return {
      loginState: state.user.loginState,
      curUserRole: state.user.role
    };
  },
  {
    checkLoginState
  }
)
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: LOADING_STATUS
    };
  }

  static propTypes = {
    checkLoginState: PropTypes.func,
    loginState: PropTypes.number,
    curUserRole: PropTypes.string
  };

  componentDidMount() {
    this.props.checkLoginState();
  }

  showConfirm = (msg, callback) => {
    // 自定义 window.confirm
    // http://reacttraining.cn/web/api/BrowserRouter/getUserConfirmation-func
    let container = document.createElement('div');
    document.body.appendChild(container);
    ReactDOM.render(<MyPopConfirm msg={msg} callback={callback} />, container);
  };

  route = status => {
    let r;
    if (status === LOADING_STATUS) {
      return <Loading visible />;
    } else {
      r = (
        <Router getUserConfirmation={this.showConfirm}>
          <div className="g-main">
            <div className="router-main">
            <Notify />
              {this.props.loginState !== 1 ? <Header /> : null}
              <div className="router-container">
                {/* <RouterConfig></RouterConfig> */}
                {Object.keys(AppRoute).map(key => {
                  let item = AppRoute[key];
                  return key === 'login' ? (
                    <Route key={key} path={item.path} component={item.component} />
                  ) : key === 'home' ? (
                    <Route key={key} exact path={item.path} component={item.component} />
                  ) : (
                    <Route
                      key={key}
                      path={item.path}
                      component={requireAuthentication(item.component)}
                    />
                  );
                })}
              </div>
            </div>
            {/* <Footer /> */}
          </div>
        </Router>
      );
    }
    return r;
  };

  render() {
    return this.route(this.props.loginState);
  }
}
