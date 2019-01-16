
const Economy = require('../models/economy');


exports.getEconomies = (req, res, next) => {
    res.send('<h1>hi there</h1>');
}

exports.postEconomy = (req, res, next) => {
    const economy = new Economy({
        address: "0x2",
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
