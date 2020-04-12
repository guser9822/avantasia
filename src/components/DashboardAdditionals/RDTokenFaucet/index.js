import React from 'react';
import './RDTokenFaucetAdditional.css'
import debounce from 'lodash/debounce'
import { getValuesFromLocalStorage } from '../../bl/utility'

export default class RDTokenFaucetAdditional extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            componentParameters: props.constructorParamList.map(() => ''),
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

    bodyTemplate = () => {
        const body = this.props.constructorParamList.map((it, index) =>
        { 
            const inputElem = this.makeInput(this.props.contractName+'.'+it, index)
            return <div
                className="RDTokenAdditional-BodyElem"
                key={index.toString()}
            >
            <label>{it}</label>
            {inputElem}
            </div>}
        );
        return body;
    }

    makeInput = (paramName, propIndex) => {
        const value = getValuesFromLocalStorage(paramName)
        return value ?
            <input type="text"
                value={value}
                readOnly
            />
            : <input type="text"
                value={this.state.componentParameters[propIndex]}
                onChange={event => this.onContractAddressChange(event, propIndex)}
            />
    }

    render() {
        return (
            <article className="RDTokenAdditional-Main">
                <div className="RDTokenAdditional">
                    {this.bodyTemplate()}
                </div>
            </article>
        );
    }

}