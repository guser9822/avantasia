import React from 'react';
import './Modal.css'
function Modal(WrappedComponent) {
    return class extends React.Component {
        render() {
            return (
                <div className="ModalSpace">
                    <div className="ModalContent">
                        <WrappedComponent />
                        <div className="ModalContent-Footer">
                            <button onClick={void(0)} disabled={void(0)}>Ok</button>
                            <button onClick={void(0)} disabled={void(0)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )
        }
    }
}
export default Modal