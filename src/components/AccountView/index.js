import React from 'react';
import './AccountView.css'

//LIB
import Web3 from 'web3'
import { getValuesFromSessionStorage } from '../bl/utility'
export default class AccountView extends React.Component {

    constructor(props) {

        const isAuthorized = getValuesFromSessionStorage('authorized');
        const userAddr = getValuesFromSessionStorage('userAddress');

        super(props);
        this.state = {
            userAddress: userAddr ? userAddr : "",
            password: '',
            authorized: isAuthorized,
            web3: undefined,
        }
    }

    componentDidMount() {
        if (this.state.authorized) {
            this.onClickAccountConnect()
        }
    }

    changeAddressHandle = (evt) => {
        this.setState({
            userAddress: evt.target.value
        })
    }

    changePasswordHandle = (evt) => {
        this.setState({
            password: evt.target.value
        })
    }

    onClickAccountConnect = () => {

        try {

            const userAddr = this.state.userAddress;
            const password = this.state.password;
            const newWEB3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));//Parity node
            const checksummedAddr = newWEB3.utils.toChecksumAddress(userAddr)

            const encryptedPass = newWEB3.utils.sha3(password)
            console.log('Encrypted pass ', encryptedPass);

            newWEB3
                .eth
                .personal
                .unlockAccount(checksummedAddr, this.state.password)
                .then(res => {
                    console.log(`Account ${checksummedAddr} unlocked !`)
                    const payLoad = {
                        web3: newWEB3,
                        authorized: true,
                        userAddress: checksummedAddr,
                    }
                    this.setState(payLoad);
                    window.sessionStorage.setItem('authorized', true);
                    window.sessionStorage.setItem('userAddress', checksummedAddr);
                    this.props.authorization(payLoad);
                }).catch(err => {
                    console.error('Error while connecting : ', err)
                });

        } catch (error) {
            console.error('Connection error : ', error)
        }

    }

    onClickLogout = () => {

        try {

            const payLoad = {
                web3: undefined,
                authorized: false,
                userAddress: '',
            }
            this.setState({ ...payLoad, password: '' });
            window.sessionStorage.removeItem('userAddress');
            window.sessionStorage.setItem('authorized', false);
            this.props.authorization(payLoad);

        } catch (error) {
            console.error('Connection error : ', error)
        }
    }

    isDisabled = () => {
        return this.state.authorized;
    }

    isConnectButtonDisabled = () => {
        return this.state.authorized ||
            this.state.userAddress === undefined ||
            this.state.userAddress === '' ||
            this.state.password === undefined ||
            this.state.password === ''
    }

    render() {
        return (
            <article>
                <h5>Login</h5>
                <div className="Account-View-Body">
                    <label>Address : </label>
                    <input
                        disabled={this.isDisabled()}
                        type="text"
                        value={this.state.userAddress}
                        onChange={this.changeAddressHandle}
                    />
                    <label>Password : </label>
                    <input
                        disabled={this.isDisabled()}
                        type="password"
                        value={this.state.password}
                        onChange={this.changePasswordHandle}
                    />
                    <div>
                        <button className="AccountView-ConnectButton"
                            onClick={this.onClickAccountConnect}
                            disabled={this.isConnectButtonDisabled()}
                        >
                            Connect
                    </button>
                        <button className="AccountView-ConnectButton"
                            onClick={this.onClickLogout}
                        >
                            Logout
                    </button>
                    </div>
                </div>
            </article>
        );
    }

}
