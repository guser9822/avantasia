import React from 'react';
import './DestroyModal.css'

export default class DestroyModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            contractName: "",
            contractAddress: "",
        }
    }
    
    changeContractNameHandle = (event) => {
        this.setState({
            contractName: event.target.value
        })
        this.props.onUpdateParams(event.target.value, this.state.contractAddress)
    }

    changeContractAddressHandle = (event) => {
        this.setState({
            contractAddress: event.target.value
        })
        this.props.onUpdateParams(this.state.contractName, event.target.value)
    }

    render() {
        return (
            <div className="DestroyModal">
                <label>Name : </label>
                <input type="text" value={this.state.contractName} onChange={this.changeContractNameHandle} />
                <label>Contract address : </label>
                <input type="text" value={this.state.contractAddress} onChange={this.changeContractAddressHandle} />
            </div>
        )
    }
}