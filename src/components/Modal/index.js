import React from 'react';
import './Modal.css'
function Modal(WrappedComponent) {
    return class extends React.Component {

        constructor(props) {
            super(props);
            this.state = {
                innerModalParams: []
            }
        }

        updateParamsHandle = (...params) => {
            this.setState({
                innerModalParams: [...params]
            })
        }

        confirmClickHandle = () => {
            this.props.onConfirm(this.state.innerModalParams)
        }

        render() {
            const template = <div className="ModalSpace">
                <div className="Modal-Body">
                    <WrappedComponent onUpdateParams={this.updateParamsHandle} />
                </div>
                <div className="Modal-Footer">
                    <button onClick={this.props.onCancel}>CANCEL</button>
                    <button onClick={this.confirmClickHandle} >CONFIRM</button>
                </div>
            </div>
            return (this.props.showModal ? template : null)
        }
    }
}
export default Modal