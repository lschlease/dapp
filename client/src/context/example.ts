// new ethers.Contract() 是 ethers.js 
// 中用于创建与智能合约进行交互的对象的方法。通过这个方法，
// 您可以实例化一个与特定智能合约地址和 ABI（Application Binary Interface）
// 相关联的合约对象，从而可以调用该合约的方法和处理事件。

// 一些关键点：
// 使用 new ethers.Contract() 方法，您可以创建一个与特定智能合约进行交互的对象。
// 在实例化合约对象时，您需要提供智能合约的地址和 ABI（合约接口）。
// 通过合约对象，您可以调用智能合约的方法，并处理从合约触发的事件。
// 示例代码：
// 下面是一个简单的示例，演示如何使用 new ethers.Contract() 
// 方法创建一个与智能合约进行交互的对象，并调用该合约的一个方法：

const { ethers } = require('ethers');

// 合约地址和 ABI
const contractAddress = '0x1234567890123456789012345678901234567890';
const contractABI = [
    // 合约方法和事件的 ABI
    {
        "constant": false,
        "inputs": [
            {
                "name": "param",
                "type": "uint256"
            }
        ],
        "name": "someMethod",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// 创建与智能合约进行交互的对象
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, contractABI, signer);

// 调用智能合约的方法
const callContractMethod = async () => {
    try {
        const param = 123; // 方法参数
        const txResponse = await contract.someMethod(param);
        console.log('智能合约方法调用成功，交易哈希:', txResponse.hash);
    } catch (error) {
        console.error('调用智能合约方法时出错:', error);
    }
};

callContractMethod();
// 在这个示例中，我们使用 new ethers.Contract()  
// 方法创建了一个与智能合约进行交互的对象，并调用了该合约的一个方法。
// 请确保提供正确的合约地址和 ABI，并且用户已经连接了钱包插件，
// 并且已经授权网页与钱包进行交互。
// 通过合约对象，您可以方便地与智能合约进行交互，调用合约的方法并处理事件。