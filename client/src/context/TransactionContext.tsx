import React, { useEffect, useState } from "react";

import { ethers } from "ethers";


import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext({}) as any;


// to  0x3b9e6760159057fAdd818353ae8DAEf5252007F3

const { ethereum } = window;

const createEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  // 拿到签名 创建合约对象
  const transactionsContract = new ethers.Contract(contractAddress, contractABI, signer);

  return transactionsContract;
};

export const TransactionsProvider = ({ children }: any) => {
    const [formData, setformData] = useState({ addressTo: "", amount: "", keyword: "", message: "" });
    // 自己的钱包地址
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

                console.log('链接到了钱包...')

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
    // 判断当前
    const checkIfWalletIsConnect = async () => {
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            const accounts = await ethereum.request({ method: "eth_accounts" });

            //拿到了钱包的链接地址 
            // console.log('accounts',accounts)
            // 赋值给currentAccount
            if (accounts.length) {
                setCurrentAccount(accounts[0]);

                // getAllTransactions();
            } else {
                console.log("No accounts found");
            }
        } catch (error) {
            console.log(error);
        }
    };
    // 判断合约记录是否存在
    const checkIfTransactionsExists = async () => {
        // try {
        //     if (ethereum) {
        //         const transactionsContract = createEthereumContract();
        //         const currentTransactionCount = await transactionsContract.getTransactionCount();

        //         window.localStorage.setItem("transactionCount", currentTransactionCount);
        //     }
        // } catch (error) {
        //     console.log(error);

        //     throw new Error("No ethereum object");
        // }
    };
    // 链接钱包
    const connectWallet = async () => {
        console.log('触发了链接钱包...')
        try {
            if (!ethereum) return alert("Please install MetaMask.");

            const accounts = await ethereum.request({ method: "eth_requestAccounts", });

            setCurrentAccount(accounts[0]);
            window.location.reload();
        } catch (error) {
            console.log(error);

            throw new Error("No ethereum object");
        }
    };

    // 发送合约
    const sendTransaction = async () => {
        console.log('123..')
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
