import Price from '../models/Price.js';
import Category from '../models/Category.js';



const admin = (req, res) => {
    res.render('properties/admin', {
        page: 'My Properties',
        bar: true,
    })
};

const create = async (req, res) => {
    // Query Price and Category Model
    const [categories, prices] = await Promise.all([
        Category.findAll(),
        Price.findAll(),
    ]);


    res.render('properties/create', {
        page: 'Publish a new property',
        bar: true,
        categories,
        prices
    })
};

export {
    admin,
    create,
};