import React from 'react';
import './Modal.css'
function Modal(WrappedComponent) {
    return class extends React.Component {
        render() {
            return (
                <div className="ModalSpace">
                    <div className="Modal-Body">
                        <WrappedComponent />
                    </div>
                    <div className="Modal-Footer">
                            <button onClick={void(0)} disabled={void(0)}>CANCEL</button>
                            <button onClick={void(0)} disabled={void(0)}>OK</button>
                        </div>
                </div>
            )
        }
    }
}
export default Modal