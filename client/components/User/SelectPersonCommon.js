import React, { PureComponent as Component } from 'react';
import { Select } from 'antd';
import { axios } from 'common/httpUtil';
import PropTypes from "prop-types";

const { Option } = Select;

class SelectPersonCommon extends Component {
    static propTypes = {
        onChange: PropTypes.func,
        value: PropTypes.number
    }

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            users: [],
            visible: false
        };
    }

    getUserList() {
        this.setState({
            loading: true
        })
        axios.get('/api/user/list', {
            params: {
                limit: 500
            }
        }).then((response) => {
            console.log(response)
            this.setState({
                users: response.data.list,
                loading: false
            })
        })
    }

    onChange = (value) => {
        this.setState({
            value: value
        })
        if (this.props.onChange) {
            this.props.onChange(value)
        }
    }

    componentWillMount() {
        this.getUserList()
        this.setState({
            value: this.props.value
        })
    }

    user = (item) => {
        return (
            <Option data={item} key={item._id} value={item._id} title={item.username}>{item.username}</Option>
        )
    }

    filter = (user) => {
        if (!this.state.search || this.state.search.lenngth == 0) {
            return true;
        }

        return user.username.indexOf(this.state.search) || user.usernamePinYin.indexOf(this.state.search)

    }

    render() {
        return (
            <div>
                <Select showSearch loading={this.state.loading} defaultValue={this.state.value} filterOption={(inputValue, option) => {
                    let user = option.props.data;
                    if(user == null){
                        return false;
                    }
                    return user.username.indexOf(inputValue) != -1 || user.usernamePinYin.indexOf(inputValue) != -1
                }}
                    onChange={this.onChange}
                    optionFilterProp={'title'}>
                    {
                        this.state.users.map(this.user)
                    }
                </Select>
            </div>
        )
    }
}

export default SelectPersonCommon;