import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';
import { ethers } from 'ethers';

const INITIAL_SUPPLY = ethers.parseEther('1000000');

export default buildModule('MyTokenModule', (m) => {
  const token = m.contract('MyToken', [INITIAL_SUPPLY]);

  return { token };
});
