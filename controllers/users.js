const Web3 = require("web3");
const economyAbi = require("../contracts/PersonalEconomy.json");


const User = require('../models/user');
const ethUtil = require('ethereumjs-util');
const sigUtil = require('eth-sig-util');
const jwt = require('jsonwebtoken');

// GET DATA FOR A SINGLE USER USING THE PUBLIC ADDRESS ADDRESS EXTRACTED FROM THE ROUTE
exports.getUser = (req, res, next) => {
    const publicAddress = req.params.publicAddress;
    User.findOne({ publicAddress: publicAddress })
        .then(user => {
            if (!user) {
                console.log('User with this address not found')
                return res.status(404).json({ message: 'No user with this address' })
            }
            res.status(200).json({ message: 'Single user fetched.', user: user });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.postUser = (req, res, next) => {
    const publicAddress = req.params.publicAddress;
    const user = new User({
        publicAddress: publicAddress,
    })
    return user.save()
        .then(result => {
            res.status(201).json({
                message: 'New user created successfully!',
                user: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.authUser = (req, res, next) => {
    const publicAddress = req.body.publicAddress;
    const signature = req.body.signature;
    const contractAddress = req.body.address;
    User.findOne({ publicAddress: publicAddress })
        .then(user => {
            const msg = `I am signing my one-time nonce: ${user.nonce}`;
            const msgBufferHex = ethUtil.bufferToHex(Buffer.from(msg, 'utf8'));
            const address = sigUtil.recoverPersonalSignature({ data: msgBufferHex, sig: signature });
            const web3 = new Web3(Web3.givenProvider || "https://rinkeby.infura.io/v3/1169d54f24964d03bbe5264bd501e47f");
            const economyContract = new web3.eth.Contract(economyAbi, contractAddress)
            economyContract.methods.balanceOf(publicAddress).call()
                .then(balance => {
                    if (address.toLowerCase() === publicAddress.toLowerCase() && balance > 0) {
                        return user;
                    } else {
                        res.status(401).send({ error: 'Ownership verification failed' });
                        const error = new Error('Ownership verification failed')
                        throw error;
                    }
                })
                .then(user => {
                    user.nonce = Math.floor(Math.random() * 10000);
                    return user.save();
                })
                .then(
                    user => {
                        const token = jwt.sign(
                            {
                                payload: {
                                    id: user.id.toString(),
                                    publicAddress
                                }
                            },
                            'long secret', // TO DO: TAKE FROM ENV!
                            { expiresIn: '1h' }
                        )
                        res.status(200).json({ token: token, userId: user.id.toString() })
                    }
                )
                .catch(err => {
                    console.log(err)
                })

        })
}