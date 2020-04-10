import React from 'react';
import './RDTokenFaucetAdditional.css'
import debounce from 'lodash/debounce'
import { _RDTokenOwner, _RDTokenContract } from '../../common'

export default class RDTokenFaucetAdditional extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            componentParameters: props.constructorParamList.map(() => ''),
            paramIndexMap: {
                _RDTokenContract: props.constructorParamList.indexOf(_RDTokenContract),
                _RDTokenOwner: props.constructorParamList.indexOf(_RDTokenOwner),
            },
            updateParentState: debounce((parameters) => { this.props.onUpdateParams([...parameters]) }, 800)
        }
    }

    onContractAddressChange = (event, index) => {

        const parameters = [...this.state.componentParameters];
        parameters[index] = event.target.value;

        this.setState({
            componentParameters: parameters,
        })

        this.state.updateParentState(parameters);
    }

    render() {
        return (
            <article>

                <div className="RDTokenAdditional">

                    <label>RDToken contract address : </label>
                    <input type="text"
                        value={this.state.componentParameters[this.state.paramIndexMap[_RDTokenContract]]}
                        onChange={event => this.onContractAddressChange(event, this.state.paramIndexMap[_RDTokenContract])}
                    />

                    <label>RDToken owner address : </label>
                    <input type="text"
                        value={this.state.componentParameters[this.state.paramIndexMap[_RDTokenOwner]]}
                        onChange={event => this.onContractAddressChange(event, this.state.paramIndexMap[_RDTokenOwner])}
                    />

                </div>
            </article>
        );
    }

}