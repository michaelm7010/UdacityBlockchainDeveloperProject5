//import 'babel-polyfill';
const StarNotary = artifacts.require('./starNotary.sol')

let instance;
let accounts;

contract('StarNotary', async (accs) => {
    accounts = accs;
    instance = await StarNotary.deployed();
  });

  it('can Create a Star', async() => {
    let tokenId = 1;
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
  });

  it('lets user1 put up their star for sale', async() => {
    let user1 = accounts[1]
    let starId = 2;
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    assert.equal(await instance.starsForSale.call(starId), starPrice)
  });

  it('lets user1 get the funds after the sale', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 3
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user1)
    await instance.buyStar(starId, {from: user2, value: starPrice})
    let balanceOfUser1AfterTransaction = web3.eth.getBalance(user1)
    assert.equal(balanceOfUser1BeforeTransaction.add(starPrice).toNumber(), balanceOfUser1AfterTransaction.toNumber());
  });

  it('lets user2 buy a star, if it is put up for sale', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 4
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2)
    await instance.buyStar(starId, {from: user2, value: starPrice});
    assert.equal(await instance.ownerOf.call(starId), user2);
  });

  it('lets user2 buy a star and decreases its balance in ether', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 5
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('awesome star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    let balanceOfUser1BeforeTransaction = web3.eth.getBalance(user2)
    const balanceOfUser2BeforeTransaction = web3.eth.getBalance(user2)
    await instance.buyStar(starId, {from: user2, value: starPrice, gasPrice:0})
    const balanceAfterUser2BuysStar = web3.eth.getBalance(user2)
    assert.equal(balanceOfUser2BeforeTransaction.sub(balanceAfterUser2BuysStar), starPrice);
  });

  // Write Tests for:

// 1) The token name and token symbol are added properly.
  it('star notary token name, symbol attributes', async () => {
    const starNotaryTokenName = await instance.name.call();
    const starNotaryTokenSymbol = await instance.symbol.call();
    assert.equal(starNotaryTokenName, 'StarNotaryToken');
    assert.equal(starNotaryTokenSymbol, 'SNT');
  });

  it('test lookup star by token ID', async() => {
    let user1 = accounts[1]
    let starId = 6;
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('death star', starId, {from: user1})
    const starName = await instance.lookUpTokenIdToStarInfo(starId);
    assert.equal(starName, 'death star');
  });

// 2) 2 users can exchange their stars.
  it('lets user1 and user2 exchange stars', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let star1Id = 7
    let star2Id = 8;
    await instance.createStar('exchange star 1', star1Id, {from: user1})
    await instance.createStar('exchange star 2', star2Id, {from: user2})
    await instance.exchangeStars(star1Id, star2Id);
    assert.equal(await instance.ownerOf.call(star1Id), user2);
    assert.equal(await instance.ownerOf.call(star2Id), user1);
  });

// 3) Stars Tokens can be transferred from one address to another.
  it('lets user1 transfer star to user2', async() => {
    let user1 = accounts[1]
    let user2 = accounts[2]
    let starId = 9
    let starPrice = web3.toWei(.01, "ether")
    await instance.createStar('transfer star', starId, {from: user1})
    await instance.putStarUpForSale(starId, starPrice, {from: user1})
    await instance.transferStar(user2, starId, {from: user1, value: starPrice, gasPrice:0});
    assert.equal(await instance.ownerOf.call(starId), user2);
  });
