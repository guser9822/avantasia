import React from 'react';


export default class Web3Connector extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            ethereum: window.ethereum,
            authorized: window.sessionStorage.getItem('authorized') ? true : false,
        };
    }

    onClickConnect = () => {

        this.state.ethereum.enable()
            .then(res => {
                this.setState({
                    authorized: true
                })
                this.props.authorization(res)
            })
            .catch(err => {
                if (err.code === 4001) { // EIP 1193 userRejectedRequest error
                    console.log('Please connect to MetaMask.')
                } else {
                    console.error(err)
                }
            })

    }

    render() {
        const showButton = !this.state.authorized ? <button onClick={this.onClickConnect}
            disabled={this.state.authorized}>Connect</button> : void undefined
        return (
            <article>
                {showButton}
            </article>
        );
    }

}