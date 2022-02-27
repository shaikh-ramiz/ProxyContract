import * as dotenv from "dotenv";

import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import { HardhatUserConfig, task } from "hardhat/config";

dotenv.config();

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  defaultNetwork: "matic",
  networks: {
    matic: {
      url: process.env.POLYGON_MUMBAI_URL,
      accounts: process.env.PRIVATE_KEY
        ? [String(process.env.PRIVATE_KEY), String(process.env.ADMIN_PRIV_KEY)]
        : [],
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY,
    },
  },
  paths: {
    artifacts: "./artifacts",
    sources: "./contracts",
    tests: "./test",
  },
};

export default config;
