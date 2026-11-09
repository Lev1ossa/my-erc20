import { expect } from 'chai';
import { network } from 'hardhat';

const { ethers } = await network.create();
const INITIAL_SUPPLY = ethers.parseEther('1000000');

describe('MyToken', function () {
  async function deployMyToken() {
    const [owner, recipient, other] = await ethers.getSigners();
    const myToken = await ethers.deployContract('MyToken', [INITIAL_SUPPLY]);

    return { myToken, owner, recipient, other };
  }

  it('Should deploy with correct initial supply', async function () {
    const { myToken, owner } = await deployMyToken();

    expect(await myToken.totalSupply()).to.equal(INITIAL_SUPPLY);
    expect(await myToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    expect(await myToken.owner()).to.equal(owner.address);
  });

  it('Should transfer tokens between accounts', async function () {
    const { myToken, owner, recipient } = await deployMyToken();
    const amount = ethers.parseEther('100');

    await myToken.transfer(recipient.address, amount);

    expect(await myToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - amount);
    expect(await myToken.balanceOf(recipient.address)).to.equal(amount);
  });

  it('Should transfer tokens using transferFrom', async function () {
    const { myToken, owner, recipient, other } = await deployMyToken();
    const amount = ethers.parseEther('50');

    await myToken.approve(other.address, amount);
    await myToken.connect(other).transferFrom(owner.address, recipient.address, amount);

    expect(await myToken.balanceOf(recipient.address)).to.equal(amount);
    expect(await myToken.allowance(owner.address, other.address)).to.equal(0n);
  });

  it('Should allow owner to mint tokens', async function () {
    const { myToken, recipient } = await deployMyToken();
    const amount = ethers.parseEther('500');

    await myToken.mint(recipient.address, amount);

    expect(await myToken.balanceOf(recipient.address)).to.equal(amount);
    expect(await myToken.totalSupply()).to.equal(INITIAL_SUPPLY + amount);
  });

  it('Should reject minting from non-owner', async function () {
    const { myToken, recipient, other } = await deployMyToken();
    const amount = ethers.parseEther('100');

    await expect(myToken.connect(other).mint(recipient.address, amount))
      .to.be.revertedWithCustomError(myToken, 'OwnableUnauthorizedAccount')
      .withArgs(other.address);
  });

  it('Should reject transfers exceeding balance', async function () {
    const { myToken, recipient, other } = await deployMyToken();
    const amount = ethers.parseEther('100');

    await expect(myToken.connect(other).transfer(recipient.address, amount))
      .to.be.revertedWithCustomError(myToken, 'ERC20InsufficientBalance')
      .withArgs(other.address, 0n, amount);
  });
});
