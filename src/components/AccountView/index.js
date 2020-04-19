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
            web3: new Web3(new Web3.providers.HttpProvider("http://localhost:8545")),//Parity node
            accountBalance: '',
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
            const web3 = this.state.web3;
            const checksummedAddr = web3.utils.toChecksumAddress(userAddr)

            web3
                .eth
                .personal
                .unlockAccount(checksummedAddr, password)
                .then(res => {
                    console.log(`Account ${checksummedAddr} unlocked !`)

                    const payload = {
                        web3,
                        authorized: true,
                        userAddress: checksummedAddr,
                    }

                    return payload
                }).then(payload => {

                    web3
                        .eth
                        .getBalance(checksummedAddr)
                        .then(accountBalance => {

                            const formatAccount = `( ${accountBalance} )`

                            this.setState({ payload, accountBalance: formatAccount });
                            window.sessionStorage.setItem('authorized', true);
                            window.sessionStorage.setItem('userAddress', checksummedAddr);
                            this.props.authorization(payload);

                        }).catch(err => {
                            console.error('Error while asking for account balance : ', err)
                        })

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

    onClickCreate = () => {

        const password = this.state.password;
        const web3 = this.state.web3;

        try {

            web3
                .eth
                .personal
                .newAccount(password).then(account => {
                    console.log(`New account created with address ${account}`);
                    window.sessionStorage.setItem('userAddress', account);
                }).catch(err => console.log('Error while creating a new account : ', err))

        } catch (error) {
            console.error('Error while creating a new account : ', error)
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
                <h5>Login {this.state.accountBalance}</h5>
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
                    <div className="AccountView-Buttons-Action">
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

                        <button className="AccountView-ConnectButton"
                            onClick={this.onClickCreate}
                        >
                            Create
                        </button>

                    </div>
                </div>
            </article>
        );
    }

}
