import React, { PureComponent as Component } from 'react';
import { Icon } from 'antd';
import CircleCheck from '@svg/check-circle.svg'
import Circle from '@svg/circle.svg'

import './Checkbox.scss'

export default class Checkbox extends Component {

    checkedChange() {
        let checked = !this.props.checked
        if (this.props.onChange) {
            this.props.onChange(checked)
        }
    }



    render() {
        function Status(props) {
            if (props.checked === true) {
                return <Icon component={() => <CircleCheck color="#54B785" width="16" height='16' />}></Icon>
            } else {
                return <Icon
                component={() => <Circle color="#54B785" width="16" height='16' />}
            ></Icon>
            }

        }
        return (
            <span className='app-checkbox-wrap' onClick={this.checkedChange.bind(this)}>
                <div className={`circle ${this.props.checked === true ? 'active' : ''}`}>
                    <Status checked={this.props.checked} />
                </div>

                {this.props.label != null ? (
                    <div className="label">
                        {this.props.label}
                    </div>
                ) : null
                }


            </span>
        )
    }

}