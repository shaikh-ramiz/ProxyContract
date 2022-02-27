// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { Contract } from "ethers";
import { ethers } from "hardhat";

const _name = "ERC20Token",
  _symbol = "ERC",
  _totalSupply = 2000000;

//** NOTE: As contract are already deployed on matic test network, static addresses are assigned **/
const deployContractFactory = async () => {
  const ERC20ContractFactory = await ethers.getContractFactory(
    "ERC20ContractFactory"
  );
  // const erc20ContractFactory = await ERC20ContractFactory.deploy();
  // await erc20ContractFactory.deployed();
  const erc20ContractFactory = ERC20ContractFactory.attach(
    "0x5881777082bD239B0F9B969076791560d1593A4D"
  );
  const erc20ContractFactoryAddress = erc20ContractFactory.address;
  console.info(
    `ERC20ContractFactory Deployed At Address: `,
    erc20ContractFactoryAddress
  );
  return erc20ContractFactory;
};

const deployTokenLogicContract = async () => {
  const ERC20Token = await ethers.getContractFactory("ERC20Token");
  // const erc20Token = await ERC20Token.deploy();
  // await erc20Token.deployed();
  const erc20Token = ERC20Token.attach(
    "0x0618BD8037cEC752dAd6f1655c6E39729761b53d"
  );
  const erc20TokenAddress = erc20Token.address;
  console.info(`ERC20Token Deployed At Address: `, erc20TokenAddress);
  return erc20TokenAddress;
};

const deployProxyContract = async (
  _erc20TokenAddress: string,
  adminAccount: string = ""
) => {
  const accounts = await ethers.getSigners();
  adminAccount =
    adminAccount.length === 42
      ? adminAccount
      : accounts?.length > 0
      ? accounts[1].address
      : "0xF930AC42386db91b0aE905d24058445812f1d855";
  console.info(`Admin Account: `, adminAccount);
  const TransparentProxy = await ethers.getContractFactory("TransparentProxy");
  // const transparentProxy = await TransparentProxy.deploy(
  //   _erc20TokenAddress,
  //   adminAccount,
  //   "[]"
  // );
  // await transparentProxy.deployed();
  const transparentProxy = TransparentProxy.attach(
    "0x6F46969E7a5171FACc69AcA6dcEf03De478A23f4"
  );
  const transparentProxyAddress = transparentProxy.address;
  console.info(`Proxy Deployed At: `, transparentProxyAddress);
  const implementationAddress = await transparentProxy.logic();
  console.info(`Implementation Address: `, implementationAddress);
  return transparentProxyAddress;
};

const setERC20ProxyAddress = async (
  erc20ContractFactory: Contract,
  transparentProxyAddress: string
) => {
  const setProxyAddress = await erc20ContractFactory.setERC20ProxyAddress(
    transparentProxyAddress
  );
  console.info(`Proxy Set Transaction Hash: `, setProxyAddress.hash);
};

const createERC20Token = async (erc20ContractFactory: Contract) => {
  for (let index = 1; index <= 5; index++) {
    const name = _name + index;
    const symbol = _symbol + index;
    const createERC20Token = await erc20ContractFactory.createERC20Token(
      name,
      symbol,
      _totalSupply + index
    );
    createERC20Token.wait();
    console.info(
      `ERC20 Creation Transaction Hash ${index}: `,
      createERC20Token.hash
    );
  }
};

const getCreatedCloneAddresses = async (erc20ContractFactory: Contract) => {
  const listOfAddresses = await erc20ContractFactory.getCreatedCloneAddresses();
  console.info(`ERC20 Clone Addresses: `, listOfAddresses);
  return listOfAddresses;
};

const checkDeployedERC20Instances = async (listOfAddresses: string[]) => {
  const ERC20Token = await ethers.getContractFactory("ERC20Token");
  listOfAddresses.forEach(async (address: string) => {
    let erc20TokenInstance = ERC20Token.attach(address);
    const name = await erc20TokenInstance.name();
    const symbol = await erc20TokenInstance.symbol();
    const totalSupply = await erc20TokenInstance.totalSupply();
    console.info(
      `\nFor Token Instance: ${address}\nName: ${name}\nSymbol: ${symbol}\nTotalSupply: ${totalSupply}\n`
    );
  });
};

const main = async () => {
  const erc20ContractFactory = await deployContractFactory();
  // const erc20TokenAddress = await deployTokenLogicContract();
  // const transparentProxyAddress = await deployProxyContract(erc20TokenAddress);
  // await setERC20ProxyAddress(erc20ContractFactory, transparentProxyAddress);
  // await createERC20Token(erc20ContractFactory);
  const listOfAddresses = await getCreatedCloneAddresses(erc20ContractFactory);
  await checkDeployedERC20Instances(listOfAddresses);
};

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
