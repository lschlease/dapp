import React, { useEffect, useState } from "react";

import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext({}) as any;

// 判断狐狸钱包是否链接
// const { ethereum } = window;

const createEthereumContract = () => {

    // ethers.providers.Web3Provider 是 ethers.js 库中的一个特殊提供者，
    // 用于在浏览器环境中与以太坊网络进行交互。
    // 它允许您使用已经存在的 window.ethereum 对象与以太坊网络进行通信。
    // 无需额外的配置即可连接到以太坊网络。
    // 这种方法适用于在浏览器中开发以太坊 DApp（去中心化应用程序）时，
    // 利用用户的钱包插件与以太坊网络进行交互。

    //   const provider = new ethers.providers.Web3Provider(ethereum);

    // provider.getSigner() 是 ethers.js 中 Web3Provider 对象的一个方法，
    // 用于获取一个 Signer 对象，通过该对象可以对交易进行签名。

    // 一些关键点：
    // 在以太坊上发送交易时，需要使用一个私钥对交易进行签名，以确保交易的有效性。
    // provider.getSigner() 方法返回一个 Signer 对象，该对象包含了与当前以太坊账户相关联的私钥，
    // 用于对交易进行签名。通过 Signer 对象，您可以创建并发送以太坊交易。


    // const signer = provider.getSigner();

    //创建智能合约交易对象
    const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);
    // getAllTransactions 
    return transactionsContract;

};

export const TransactionsProvider = ({ children }: any) => {
    const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
    const [currentAccount, setCurrentAccount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem("transactionCount"));
    const [transactions, setTransactions] = useState([]);

    const handleChange = (e: { target: { value: any; }; }, name: any) => {
        setformData((prevState) => ({ ...prevState, [name]: e.target.value }));
    };

    // 获取全部的交互记录
    const getAllTransactions = async () => {
        try {
            // 如何浏览器链接了钱包
            if (ethereum) {

                // 创建一个 可以和这个合约交互的对象
                const transactionsContract = createEthereumContract();

                //调用的是合约里面定义的函数
                const availableTransactions = await transactionsContract.getAllTransactions();

                const structuredTransactions = availableTransactions.map((transaction: { receiver: any; sender: any; timestamp: { toNumber: () => number; }; message: any; keyword: any; amount: { _hex: string; }; }) => ({
                    addressTo: transaction.receiver,
                    addressFrom: transaction.sender,
                    timestamp: new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
                    message: transaction.message,
                    keyword: transaction.keyword,
                    amount: parseInt(transaction.amount._hex) / (10 ** 18)
                }));

                console.log(structuredTransactions);

                setTransactions(structuredTransactions);
            } else {
                console.log("Ethereum is not present");
            }
        } catch (error) {
            console.log(error);
        }
    };
    // 判断网络是否连接
    const checkIfWalletIsConnect = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            const accounts = await ethereum.request({ method: "eth_accounts" });

            if (accounts.length) {
                setCurrentAccount(accounts[0]);

                getAllTransactions();
            } else {
                console.log("No accounts found");
            }
        } catch (error) {
            console.log(error);
        }
    };
    // 判断合约记录是否存在
    const checkIfTransactionsExists = async () => {
        try {
            if (ethereum) {
                const transactionsContract = createEthereumContract();
                const currentTransactionCount = await transactionsContract.getTransactionCount();

                window.localStorage.setItem("transactionCount", currentTransactionCount);
            }
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object");
        }
    };
    // 链接钱包
    const connectWallet = async () => {
        console.log('触发了链接钱包...')
        // try {
        //     if (!ethereum) return alert("Please install MetaMask.");

        //     const accounts = await ethereum.request({ method: "eth_requestAccounts", });

        //     setCurrentAccount(accounts[0]);
        //     window.location.reload();
        // } catch (error) {
        //     console.log(error);
        
        //     throw new Error("No ethereum object");
        // }
    };

    // 发送合约
    const sendTransaction = async () => {
        try {
            if (ethereum) {
                const { addressTo, amount, keyword, message } = formData;
                const transactionsContract = createEthereumContract();
                const parsedAmount = ethers.utils.parseEther(amount);

                await ethereum.request({
                    method: "eth_sendTransaction",
                    params: [{
                        from: currentAccount,
                        to: addressTo,
                        gas: "0x5208",
                        value: parsedAmount._hex,
                    }],
                });

                const transactionHash = await transactionsContract.addToBlockchain(addressTo, parsedAmount, message, keyword);

                setIsLoading(true);
                console.log(`Loading - ${transactionHash.hash}`);
                await transactionHash.wait();
                console.log(`Success - ${transactionHash.hash}`);
                setIsLoading(false);

                const transactionsCount = await transactionsContract.getTransactionCount();

                setTransactionCount(transactionsCount.toNumber());
                window.location.reload();
            } else {
                console.log("No ethereum object");
            }
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object");
        }
    };

    useEffect(() => {
        checkIfWalletIsConnect();
        checkIfTransactionsExists();
    }, [transactionCount]);

    return (
        <TransactionContext.Provider
            value={{
                //发送数量
                transactionCount,
                //链接钱包
                connectWallet,
                //交互记录
                transactions,
                //确认金额
                currentAccount,
                // 发送中
                isLoading,
                //触发发送操作
                sendTransaction,
                // 点击事件
                handleChange,
                //data
                formData,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};
