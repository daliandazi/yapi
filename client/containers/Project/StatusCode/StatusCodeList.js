import React, { PureComponent as Component } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Layout, Menu, Icon } from 'antd';
import { Route, Switch, matchPath } from 'react-router-dom';
import { connect } from 'react-redux';
const { Content, Sider } = Layout;


@connect(
    state => {
        return {
        };
    }
)
class StatusCodeList extends Component {


    render() {
        return (
            <div></div>
        )
    }
}

export default StatusCodeList