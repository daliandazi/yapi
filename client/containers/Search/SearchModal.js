import React, { PureComponent as Component } from 'react';
import { Modal, Input } from 'antd';
import { axios } from 'common/httpUtil';

export class SearchModal extends React.Component {

    state = {
        visible: false,
        keyWord: ""
    }

    search() {
        axios.post("/api/search", {
            data: {
                keyWord: this.state.keyWord
            }
        }).then(response => {
            console.log(response)
        })
    }

    render() {
        return (
            <Modal
                visible={this.props.visible}
                footer={ }

            >
                <div>
                    <Input value={this.state.keyWord} onChange={(e) => {
                        this.setState({
                            keyWord: e.target.value
                        }, () => {
                            this.search()

                        })
                    }}></Input>
                </div>
                <div>

                </div>
            </Modal>
        )
    }

}