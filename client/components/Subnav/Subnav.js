import './Subnav.scss';
import React, { PureComponent as Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Menu, Icon } from 'antd';

class Subnav extends Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    data: PropTypes.array,
    default: PropTypes.string,
    inlineCollapsed: PropTypes.bool
  };

  badge(count) {
    if (count == null) {
      return "";
    }
    return (
      <div style={{ height: '17px', textAlign: 'center', fontSize: '12px', color: '#8189A1', lineHeight: '11px', padding: '2px 5px', position: 'absolute', right: 10, top: 10, backgroundColor: '#D8DCE4', border: '1px solid #D9D9D9', borderRadius: '8px' }}>{count}</div>
    )
  }

  render() {
    return (
      <div>
        <Menu
          onClick={this.handleClick}
          selectedKeys={[this.props.default]}
          mode="inline"
          style={{ backgroundColor: '#F7F7F7', height: '100%' }}
        >
          {this.props.data.map((item, index) => {
            // 若导航标题为两个字，则自动在中间加个空格
            if (item.name.length === 2) {
              item.name = item.name[0] + ' ' + item.name[1];
            }
            return (
              <Menu.Item key={item.name.replace(' ', '')} overflowedIndicator={<Icon type={item.icon} />} title={item.name}>
                <Link to={item.path}><Icon type={item.icon} /><span>{this.props.data[index].name} {this.badge(item.count)}</span> </Link>
              </Menu.Item>
            );
          })}
        </Menu>
        {/* <div>
          <ul class="subnav-left-menu">
            {this.props.data.map((item, index) => {
              // 若导航标题为两个字，则自动在中间加个空格
              if (item.name.length === 2) {
                item.name = item.name[0] + ' ' + item.name[1];
              }
              return (
                < li style={{}}><Icon style={{ fontSize: '20px' }} type={item.icon}></Icon><div>{this.props.data[index].name}</div></li>
              )
            })
            }

            <li  class="active" ><Icon style={{ fontSize: '20px' }} type="api"></Icon><div>接口测试</div></li>
            <li><Icon style={{ fontSize: '20px' }} type="eye"></Icon><div>状态码</div></li>
          </ul>
        </div> */}
      </div >
    );
  }
}

export default Subnav;
