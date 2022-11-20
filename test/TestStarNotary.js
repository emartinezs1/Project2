const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];

    it('can Create a Star', async() => {
        let tokenId = 1;
        let instance = await StarNotary.deployed();
        await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
        assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
    });
    
    it('lets user1 put up their star for sale', async() => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let starId = 2;
        let starPrice = web3.utils.toWei(".01", "ether");
        await instance.createStar('awesome star', starId, {from: user1});
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
        assert.equal(await instance.starsForSale.call(starId), starPrice);
    });
    
    it('lets user1 get the funds after the sale', async() => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId = 3;
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");
        await instance.createStar('awesome star', starId, {from: user1});
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
        let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
        await instance.buyStar(starId, {from: user2, value: balance});
        let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
        let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
        let value2 = Number(balanceOfUser1AfterTransaction);
        assert.equal(value1, value2);
    });
    
    it('lets user2 buy a star, if it is put up for sale', async() => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId = 4;
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");
        await instance.createStar('awesome star', starId, {from: user1});
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
        let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
        await instance.buyStar(starId, {from: user2, value: balance});
        assert.equal(await instance.ownerOf.call(starId), user2);
    });
    
    it('lets user2 buy a star and decreases its balance in ether', async() => {
        let instance = await StarNotary.deployed();
        let user1 = accounts[1];
        let user2 = accounts[2];
        let starId = 5;
        let starPrice = web3.utils.toWei(".01", "ether");
        let balance = web3.utils.toWei(".05", "ether");
        await instance.createStar('awesome star', starId, {from: user1});
        await instance.putStarUpForSale(starId, starPrice, {from: user1});
        const balanceOfUser2BeforeTransaction = web3.utils.toBN(await web3.eth.getBalance(user2));
        let receipt = await instance.buyStar(starId, {from: user2, value: balance});
        let tx = await web3.eth.getTransaction(receipt.tx);
        const balanceAfterUser2BuysStar = web3.utils.toBN(await web3.eth.getBalance(user2));
        let gasUsed = web3.utils.toBN(receipt.receipt.gasUsed);
        let gasPrice = web3.utils.toBN(tx.gasPrice);
        let gasCost = gasUsed.mul(gasPrice);
        let value = balanceOfUser2BeforeTransaction.sub(balanceAfterUser2BuysStar).sub(gasCost);
        assert.equal(value, starPrice);
    });
    
    // Implement Task 2 Add supporting unit tests
    
    it('can add the star name and star symbol properly', async() => {
        // 1. create a Star with different tokenId
        // 2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
        let starNotary = await StarNotary.deployed();
        let name = await starNotary.name();
        let symbol = await starNotary.symbol();
        assert.equal(name, "Star Token");
        assert.equal(symbol, "STA");
    });
    
    it('lets 2 users exchange stars', async() => {
        // 1. create 2 Stars with different tokenId
        // 2. Call the exchangeStars functions implemented in the Smart Contract
        // 3. Verify that the owners changed
        let starNotary = await StarNotary.deployed();
        let star1Id = 6;
        let star2Id = 7;
        let user1 = owner;
        let user2 = accounts[1];
        await starNotary.createStar("Star 1", star1Id, {from: user1});
        await starNotary.createStar("Star 2", star2Id, {from: user2});
        await starNotary.exchangeStars(star1Id, star2Id, {from: user1});
        let star1Owner = await starNotary.ownerOf(star1Id);
        let star2Owner = await starNotary.ownerOf(star2Id);
        assert(star2Owner, user1);
        assert(star1Owner, user2);
    });
    
    it('lets a user transfer a star', async() => {
        // 1. create a Star with different tokenId
        // 2. use the transferStar function implemented in the Smart Contract
        // 3. Verify the star owner changed.
        let starNotary = await StarNotary.deployed();
        let starId = 8;
        let user1 = owner;
        let user2 = accounts[1];
        await starNotary.createStar("Star", starId, {from: user1});
        await starNotary.transferStar(user2, starId, {from: user1});
        let starOwner = await starNotary.ownerOf(starId);
        assert(starOwner == user2);
    });
    
    it('lookUptokenIdToStarInfo test', async() => {
        // 1. create a Star with different tokenId
        // 2. Call your method lookUptokenIdToStarInfo
        // 3. Verify if you Star name is the same
        let starNotary = await StarNotary.deployed();
        let starId = 9;
        let starName = "Test Star";
        await starNotary.createStar(starName, starId, {from: owner});
        let starInfo = await starNotary.lookUptokenIdToStarInfo(starId);
        assert(starInfo == starName);
    });
});
