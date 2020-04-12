import React from 'react';
import './Container.css'
function Container(WrappedComponent, constructorParamList, contractName) {
    return class extends React.Component {
        updateParamsHandle = (params) => {
            this.props.onParamsChange(params)
        }

        render() {
            const template =
                <div className="ContainerSpace">
                    <WrappedComponent
                        contractName={contractName}
                        constructorParamList={[...constructorParamList]}
                        onUpdateParams={this.updateParamsHandle}
                    />
                </div>;
            return template
        }
    }
}
export default Container