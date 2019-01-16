
const Economy = require('../models/economy');


exports.getEconomies = (req, res, next) => {
    console.log('happening');

    Economy.find()
        .then(economies => {
            res
                .status(200)
                .json({ 
                    message: 'Fetched all economies successfully.', 
                    // economies: economies // probably too big because of images
                });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

exports.getEconomy = (req, res, next) => {
    const tokenAddress = req.params.tokenAddress;
    Economy.findOne({ tokenAddress: tokenAddress })
        .then(economy => {
            if (!economy) {
                const error = new Error('Could not find economy.');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({ message: 'Single economy fetched.', economy: economy });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

// ONLY FOR TESTING:
exports.postEconomy = (req, res, next) => {
    const economy = new Economy({
        tokenAddress: "0x2",
        ipfsHash: "3",
        JSON: {}
    })
    economy.save()
        .then(result => {
            res.status(201).json({
                message: 'Economy created successfully!',
                economy: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};
