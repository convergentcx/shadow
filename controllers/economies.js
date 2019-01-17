
const Economy = require('../models/economy');

// GET DATA FOR ALL ECONOMIES (TO LOAD OVERVIEW PAGE)
exports.getEconomies = (req, res, next) => {
    Economy.find()
        .then(economies => {
            res
                .status(200)
                .json({
                    message: 'Fetched all economies successfully.',
                    economies: economies
                });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}

// GET DATA FOR A SINGLE ECONOMY USING THE TOKEN ADDRESS EXTRACTED FROM THE ROUTE
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

// POST NEW ECONOMY FROM OUTSIDE // ONLY FOR TESTING/POSTMAN!
exports.postEconomy = (req, res, next) => {
    const economy = new Economy({
        tokenAddress: "0x0",
        ipfsHash: "XYZ",
        data: {
            name: "TEST",
            symbol: "TEST"
        }
    })
    economy.save()
        .then(result => {
            res.status(201).json({
                message: 'Test economy created successfully!',
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
