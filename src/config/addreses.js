import Abi from './abi.json';
import PayableAbi from './payable.json';
import TestAbi from './test.json';
import TokenAbi from './token.json';
import TronTestAbi from './tronTest.json';

const contractAddress = 'LXtDV7gx9PmqRpwPxAxD9qeEEqSGBNkdf6';
const tokenAddress = 'LNs3WdXmDDsbKB3dagpdyuG4eMiv4ez3cn';
const payableAddress = 'LM8nTQ7gsBgTt2SVTmpeaDuiLwNGpd7rXi';
const testAddress = 'LYCGa7nD1EzWfdCoGexn7cVVHFao7b7jyb';
const proxyAddress = 'LcCnFSAceFXMgYfTF6CD1GrRUf5KT5DM6U';
export function getContractAddress() {
  return contractAddress;
}

export function getAbi() {
  return Abi;
}

export function getPayAbi() {
  return PayableAbi;
}

export function getPayableAddress() {
  return payableAddress;
}

export function getTestAbi() {
  return TestAbi;
}

export function getTestAddress() {
  return testAddress;
}

export function getTokenAddress() {
  return tokenAddress;
}

export function getTokenAbi() {
  return TokenAbi;
}

export function getProxyAddress() {
  return proxyAddress;
}

export function getTronTestAbi() {
  return TronTestAbi;
}
