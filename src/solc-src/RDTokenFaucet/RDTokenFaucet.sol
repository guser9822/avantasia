pragma solidity ^0.6.0;

import "../../../node_modules/@openzeppelin/contracts/ownership/Ownable.sol";
import "../RDToken/RDToken.sol";

// Our first contract is a faucet!
contract RDTokenFaucet is Ownable {

    event Withdrawal(address indexed to, uint amount);
	event Deposit(address indexed from, uint amount);

    RDToken public RDTokenContract;
    address public RDTokenContractOwner;

    constructor(address _RDTokenContract, address _RDTokenOwner) public {
        RDTokenContract = RDToken(_RDTokenContract);//get the deployed contract
        RDTokenContractOwner = _RDTokenOwner;
    }

    // Give out RDT to anyone who asks
    function withdraw(uint withdraw_amount) public {

        RDTokenContract.transferFrom(RDTokenContractOwner, msg.sender, withdraw_amount);

        //Emit withdraw
        emit Withdrawal(msg.sender, withdraw_amount);
    }
    
    //Get faucet balance
    function getBalance() public view returns (uint balance) {
        return RDTokenContract.balanceOf(RDTokenContractOwner);
    }

    // Invoked when no function match. If non- payable transaction will revert
    fallback () external payable { revert(); }

    // Invoked when call data is empty
    receive() external payable{
        revert();
    }

    // Contract destructor
    function destroy() public onlyOwner {
        selfdestruct(payable(owner()));
    }

}