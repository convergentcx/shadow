const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Web3 = require("web3");
const factoryAbi = require("./contracts/PersonalEconomyFactory.json");
const economyAbi = require("./contracts/PersonalEconomy.json");

const ipfsApi = require('ipfs-api');
const getMultihashFromBytes32 = require('./utils/utils');

const Economy = require('./models/economy');
const economyRoutes = require('./routes/economies');

app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(economyRoutes)


mongoose.connect('mongodb+srv://achill:w8BG6xR351pqX6DC@cluster0-xfiey.mongodb.net/tokens')
    .then(res => {
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })

    

// SETUP IPFS AND WEB3 CONNECTION FOR FETCHING USER'S PERSONAL ECONOMY DATA

const factoryAddress = "0xD3f6603fEc53a3175803F5ac99363aA6D3c528Df";
const ipfs = ipfsApi('ipfs.infura.io', '5001', { protocol: 'https' });
// need websocket provider for event listening:
const web3socket = new Web3(new Web3.providers.WebsocketProvider("wss://rinkeby.infura.io/ws"));
const socketInstance = new web3socket.eth.Contract(factoryAbi, factoryAddress);
// and regular provider for regular contract calls:
const web3 = new Web3(Web3.givenProvider || "https://rinkeby.infura.io/v3/1169d54f24964d03bbe5264bd501e47f");
const contract = new web3.eth.Contract(factoryAbi, factoryAddress);


// LISTEN TO FACTORY CONTRACT FOR NEW "CREATED" EVENTS AND STORE NEW ECONOMY'S DATA IN MONGODB

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
            const dataJson = JSON.parse(files[0].content.toString());
            const { description, image, name, symbol, services, tags } = dataJson;            
            const newEconomy = new Economy({
                tokenAddress: tokenAddress,
                ipfsHash: multihash,
                data: {
                    name: name,
                    symbol: symbol,
                    description: description,
                    services: services,
                    tags: tags
                }
            });
            newEconomy.save()
                .then(result => {
                    console.log('New economy saved.')
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


// TBD: LISTEN TO EACH ECONOMY CONTRACT FOR "UPDATED" EVENTS AND STORE NEW ECONOMY'S DATA IN MONGODB
// Steps:
// 1. get array of token addresses from factory contract
// 2. for each token address instantiate websocket connection, to be able to listen to "updated" event
// 3. on updated event, fetch new ipfs as above, find existing economy in database and save


// GO THROUGH ALL EXISTING ECONOMIES AND MAKE SURE THAT CURRENT DATA IS STORED

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
                    // FOR SOME LOOPS / SOME TOKENS THE IPFS REQUEST FAILS (!) 
                    // THERE SEEMS TO BE A RATE LIMITATION BY IPFS-INFURA
                    // WILL HAVE TO IMPLEMENT POLLING/RETRYING INSTEAD OF JUST PULLING ALL DATA IN ONE GO.
                    if (!files) { 
                        // TO SEE WHICH ECONOMIES WHERE NOT FETCHED:
                        // console.log('token: ', tokenAddress, ' ipfsHash: ', multihash)
                        return 
                    }
                    const dataJson = JSON.parse(files[0].content.toString());
                    const { description, image, name, symbol, services, tags } = dataJson;
                    Economy.findOne({ tokenAddress: tokenAddress })
                        .then(economy => {
                            // If the economy is not yet in the database, create a new one
                            if (!economy) {
                                const newEconomy = new Economy({
                                    tokenAddress: tokenAddress,
                                    ipfsHash: multihash,
                                    data: {
                                        name: name,
                                        symbol: symbol,
                                        description: description,
                                        services: services,
                                        tags: tags
                                    }
                                });
                                return newEconomy.save()
                                    .then(result => {
                                        console.log('New economy saved.')
                                    });
                            }
                            // Only update if the ipfs file has changed
                            if (economy.ipfsHash === multihash) {
                                return
                            }
                            economy.ipfsHash = multihash;
                            economy.data.description = description;
                            economy.data.services = services;
                            economy.data.tags = tags;

                            economy.save()
                                .then(result => {
                                    console.log('Existing economy updated.')
                                    // res.status(201).json({
                                    //     message: 'Existing economy updated!',
                                    //     economy: result
                                    // });
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

