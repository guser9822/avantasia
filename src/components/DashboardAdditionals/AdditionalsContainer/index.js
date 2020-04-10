import React from 'react';
import './Container.css'
function Container(WrappedComponent, constructorParamList) {
    return class extends React.Component {
        updateParamsHandle = (params) => {
            this.props.onParamsChange(params)
        }

        render() {
            const template =
                <div className="ContainerSpace">
                    <WrappedComponent
                        constructorParamList={[...constructorParamList]}
                        onUpdateParams={this.updateParamsHandle}
                    />
                </div>;
            return template
        }
    }
}
export default Container