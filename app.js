const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Web3 = require("web3");
const factoryAbi = require("./contracts/PersonalEconomy_ABI.json");
const economyAbi = require("./contracts/PersonalEconomy.json");


const ipfsApi = require('ipfs-api');
const bs58 = require('bs58');

const Economy = require('./models/economy');

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


mongoose.connect('mongodb+srv://achill:w8BG6xR351pqX6DC@cluster0-xfiey.mongodb.net/tokens')
    .then(res => {
        app.listen(3003);
    })
    .catch(err => {
        console.log(err);
    })


// SOME UTILS FOR FETCHING EVERY USER'S PERSONAL ECONOMY DATA

const factoryAddress = "0xD3f6603fEc53a3175803F5ac99363aA6D3c528Df";
const ipfs = ipfsApi('ipfs.infura.io', '5001', { protocol: 'https' });
const getMultihashFromBytes32 = mhashObj => {
    const { digest, hashFunction, size } = mhashObj;
    if (size === 0) return null;

    const hashBytes = Buffer.from(digest.slice(2), 'hex');

    const multihashBytes = new hashBytes.constructor(2 + hashBytes.length);
    multihashBytes[0] = hashFunction;
    multihashBytes[1] = size;
    multihashBytes.set(hashBytes, 2);
    return bs58.encode(multihashBytes);
};



// LISTEN TO FACTORY CONTRACT FOR NEW CREATED EVENT AND STORE NEW ECONOMY'S DATA IN MONGODB

const web3socket = new Web3(new Web3.providers.WebsocketProvider("wss://rinkeby.infura.io/ws"));
const socketInstance = new web3socket.eth.Contract(factoryAbi, factoryAddress);
socketInstance.events.Created((err, createdEvent) => {
    const tokenAddress = createdEvent.returnValues.token_address;
    // get IPFS hash and data
    // instantiate personal economy contract in order to get IPFS hash
    const economyContract = new web3.eth.Contract(economyAbi, tokenAddress)
    economyContract.methods.mhash().call().then(hash => {
        // retrieve IPFS data
        const multihash = getMultihashFromBytes32({
            digest: hash,
            hashFunction: 18,
            size: 32,
        });
        ipfs.get(multihash, (err, files) => {
            // NOT NECESSARY TO PARSE DATA, SINCE THIS IS DONE ANYWAYS ON THE FRONTEND
            // let data;
            // if (files) { // HOW COME THERE ARE ECONOMIES WITHOUT FILES ?!
            //     data = JSON.parse(files[0].content.toString());
            // }
            economy = new Economy({
                tokenAddress: tokenAddress,
                ipfsHash: multihash,
                JSON: files
            });
            economy.save()
            .then(result => {
                console.log('New economy saved.')
                res.status(201).json({
                    message: 'Economy created successfully!',
                    economy: result
                });
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                // next(err);
            });
        });
    })
})


// GO THROUGH ALL EXISTING ECONOMIES AND MAKE SURE THAT CURRENT DATA IS STORED

const web3 = new Web3(Web3.givenProvider || "https://rinkeby.infura.io/v3/1169d54f24964d03bbe5264bd501e47f");
const contract = new web3.eth.Contract(factoryAbi, factoryAddress);
contract.getPastEvents('Created', { fromBlock: 0, toBlock: "latest" })
    .then(eventArray => {
        eventArray.forEach(createdEvent => {
            const tokenAddress = createdEvent.returnValues.token_address;
            // instantiate personal economy contract in order to get IPFS hash
            const economyContract = new web3.eth.Contract(economyAbi, tokenAddress)
            economyContract.methods.mhash().call().then(hash => {
                // retrieve IPFS data
                const multihash = getMultihashFromBytes32({
                    digest: hash,
                    hashFunction: 18,
                    size: 32,
                });
                ipfs.get(multihash, (err, files) => {
                    // NOT NECESSARY TO PARSE DATA, SINCE THIS IS DONE ANYWAYS ON THE FRONTEND
                    // let data;
                    // if (files) { // HOW COME THERE ARE ECONOMIES WITHOUT FILES ?!
                    //     data = JSON.parse(files[0].content.toString());
                    // }
                    economy = new Economy({
                        tokenAddress: tokenAddress,
                        ipfsHash: multihash,
                        JSON: files
                    });
                    economy.save()
                    .then(result => {
                        console.log('Existing economy saved.')
                        res.status(201).json({
                            message: 'Economy created successfully!',
                            economy: result
                        });
                    })
                    .catch(err => {
                        if (!err.statusCode) {
                            err.statusCode = 500;
                        }
                        // next(err);
                    });
                });
            })
        })
    });



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

