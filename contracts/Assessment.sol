// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    // Loan calculator function
    function calculateMonthlyPayment(uint256 _loanAmount, uint256 _interestRate, uint256 _repaymentTerm) public pure returns(uint256) {
        uint256 monthlyInterestRate = (_interestRate * 1e16) / (12 * 100); // Convert annual interest rate to monthly and adjust decimal precision
        uint256 numPayments = _repaymentTerm * 12;
        uint256 monthlyPayment = (_loanAmount * monthlyInterestRate * ((1 + monthlyInterestRate) ** numPayments)) / (((1 + monthlyInterestRate) ** numPayments) - 1);
        return monthlyPayment;
    }

    // Function to calculate gas fee
    function calculateGasFee(uint256 _transactionAmount) public pure returns(uint256) {
        uint256 gasFee = (_transactionAmount * 0.005) / 100; // Assuming gas fee is 0.5% of the transaction amount
        return gasFee;
    }
}
