pragma solidity ^0.6.0;

import "../../../node_modules/@openzeppelin/contracts/access/Ownable.sol";

// Our first contract is a faucet!
contract Faucet is Ownable {

    event Withdrawal(address indexed to, uint amount);
	event Deposit(address indexed from, uint amount);

    // Give out ether to anyone who asks
    function withdraw(uint withdraw_amount) public {
        // Limit withdrawal amount
        require(withdraw_amount <= 0.1 ether,'To much ether!');

        //Check if ther's enough ether in the balance
        require(address(this).balance >= withdraw_amount, "Insufficient balance in faucet for withdrawal request");

        // Send the amount to the address that requested it
        msg.sender.transfer(withdraw_amount);

        //Emit withdraw
        emit Withdrawal(msg.sender, withdraw_amount);
    }
    
    //Get faucet balance
    function getBalance() public view returns (uint balance) {
        return address(this).balance;
    }

    // Invoked when no function match. If non- payable transaction will revert
    fallback() external {}

    // Invoked when call data is empty
    receive() external payable{
        emit Deposit(msg.sender, msg.value);
    }

    // Contract destructor
    function destroy() public onlyOwner {
        selfdestruct(payable(owner()));
    }

}