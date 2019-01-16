const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const economyRoutes = require('./routes/economies');


app = express();

app.use(bodyParser.json()); // application/json



app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(economyRoutes)


mongoose.connect('mongodb+srv://achill:w8BG6xR351pqX6DC@cluster0-xfiey.mongodb.net/economies')
    .then(res => {
        app.listen(3001);
    })
    .catch(err => {
        console.log(err);
    })



    // const Web3 = require("web3");
    // const abi = require("./smart_contract.json");
    
    // if (typeof web3 !== "undefined") {
    //   web3 = new Web3(web3.currentProvider);
    // } else {
    //   // set the provider you want from Web3.providers
    //   web3 = new Web3(new Web3.providers.HttpProvider("http://34.245.74.26:8545"));
    // }
    // const address = "0xbaa593e9c1f11bbcfa4725085211d764eec26592";
    // const contract = web3.eth.contract(abi).at(address);
    // const event = contract.allEvents({ fromBlock: 0, toBlock: "latest" });
    // const user_repository = require("./user/user_repository");
    // if (!web3.isConnected()) {
    //   console.log("********\n\n\n\n\n\n");
    //   console.log("Please run blockchain node!!");
    //   console.log("\n\n\n\n\n\n********");
    //   process.exit();
    // }
    
    // event.watch((error, data) => {
    //   if (!data.args) {
    //     return;
    //   }
    
    //   const user_address = data.args.user_address;
    //   const endorsement = parseInt(data.args.endorsement / 10 ** 18);
    //   const balance = parseInt(data.args.balance / 10 ** 18);
    
    //   const transaction = {
    //     id: `${data.transactionHash}`,
    //     endorsement: endorsement,
    //     balance: balance
    //   };
    //   console.log("Tx data", data.transactionHash);
    //   co(user_repository.getUserByAddress(user_address))
    //     .then(user => {
    //       user.endorsement = endorsement;
    //       user.balance = balance;
    //       if (user.transactions.filter(x => x.id == transaction.id).length < 1) {
    //         user.transactions.push(transaction);
    //       }
    //       user.save(() =>
    //         console.log(
    //           `tx ${
    //             transaction.id
    //           }: User ${user_address} saved, endorsement ${endorsement}, balance ${endorsement}`
    //         )
    //       );
    //     })
    //     .catch(err => logger.error("._."));
    // });

