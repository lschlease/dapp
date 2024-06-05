import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: '0.8.0',
  networks: {
    sepolia: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/xzknrQoDEJasmSxboocAIJ2OKS4NTXh5',
      accounts: ['8473bdac56fb0da971d6a4619642d0e06b7a98637dfd157e1a478e06bd95085b'],
    },
  },
};

export default config;


