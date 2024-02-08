import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [loanAmount, setLoanAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [repaymentTerm, setRepaymentTerm] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [transactionAmount, setTransactionAmount] = useState(0);
  const [transactionType, setTransactionType] = useState(null);
  const [gasFee, setGasFee] = useState(0);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      const gasLimit = 100000; // You may adjust this value based on your contract's requirements
      const gasPrice = await ethWallet.request({ method: 'eth_gasPrice' });
      const gasFee = ethers.utils.parseEther((transactionAmount * 0.005).toString()); // Calculate gas fee as 1% of the deposit amount
      setGasFee(gasFee);
      
      let tx = await atm.deposit(transactionAmount, { gasLimit, gasPrice: gasPrice.toString() });
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      const gasLimit = 100000; // You may adjust this value based on your contract's requirements
      const gasPrice = await ethWallet.request({ method: 'eth_gasPrice' });
      const gasFee = ethers.utils.parseEther((transactionAmount * 0.005).toString()); // Calculate gas fee as 1% of the withdrawal amount
      setGasFee(gasFee);
      
      let tx = await atm.withdraw(transactionAmount, { gasLimit, gasPrice: gasPrice.toString() });
      await tx.wait();
      getBalance();
    }
  };

  const calculateLoan = () => {
    // Implement loan calculation logic here
    // This is a basic example, you might want to use a library or implement more complex logic
    const monthlyInterestRate = interestRate / 100 / 12;
    const numPayments = repaymentTerm * 12;
    const loanAmountWithInterest = loanAmount * (1 + monthlyInterestRate) ** numPayments;
    const monthlyPayment = loanAmountWithInterest / numPayments;
    setMonthlyPayment(monthlyPayment);
  };

  const handleTransactionAmountChange = (event) => {
    setTransactionAmount(parseFloat(event.target.value));
  };

  const handleTransactionTypeChange = (type) => {
    setTransactionType(type);
  };

  const confirmTransaction = () => {
    if (transactionType === "deposit") {
      deposit();
    } else if (transactionType === "withdraw") {
      withdraw();
    }
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <div>
          <h2>Loan Calculator</h2>
          <label>
            Loan Amount:
            <input type="number" value={loanAmount} onChange={(e) => setLoanAmount(parseFloat(e.target.value))} />
          </label>
          <br />
          <label>
            Interest Rate (%):
            <input type="number" value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value))} />
          </label>
          <br />
          <label>
            Repayment Term (years):
            <input type="number" value={repaymentTerm} onChange={(e) => setRepaymentTerm(parseFloat(e.target.value))} />
          </label>
          <br />
          <button onClick={calculateLoan}>Calculate Loan</button>
          <p>Monthly Payment: {monthlyPayment}</p>
        </div>
        <div>
          <h2>Deposit/Withdraw</h2>
          <label>
            Amount:
            <input type="number" onChange={handleTransactionAmountChange} />
          </label>
          <br />
          <button onClick={() => handleTransactionTypeChange("deposit")}>Deposit</button>
          <button onClick={() => handleTransactionTypeChange("withdraw")}>Withdraw</button>
          {transactionType && (
            <div>
              <p>Transaction Type: {transactionType}</p>
              <p>Transaction Amount: {transactionAmount}</p>
              <button onClick={confirmTransaction}>Confirm Transaction</button>
              <p>Gas Fee: {ethers.utils.formatEther(gasFee)}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
