import React, {PureComponent as Component} from 'react';
import {Select} from 'antd';
import {axios} from 'common/httpUtil';
import PropTypes from "prop-types";

const {Option} = Select;

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
            <Option key={item._id} value={item._id} title={item.username}>{item.username}</Option>
        )
    }

    render() {
        return (
            <div>
                <Select showSearch loading={this.state.loading} defaultValue={this.state.value} onChange={this.onChange}
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