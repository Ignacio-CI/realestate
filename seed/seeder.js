import { exit } from 'node:process'
import categories from './categories.js';
import prices from './prices.js'
import db from '../config/db.js';
import { Category, Price, Property, User } from '../models/index.js'

const getData = async () => {
    try {
        // Authenticate
        await db.authenticate();

        // Generate the columns
        await db.sync();

        // Insert date into database
        await Promise.all([
            Category.bulkCreate(categories),
            Price.bulkCreate(prices)
        ]);

        console.log('Data imported successfully');
        exit(); // empty or 0 means success

    } catch (error) {
        console.log(error);
        exit(1); // the number 1 means that there was an error
    }
}

const deleteData = async () => {
    try {
        // await Promise.all([
        //     Category.destroy({ where: {}, truncate: true }),
        //     Price.destroy({ where: {}, truncate: true })
        // ]);

        //shorter way to delete data 
        await db.sync({force: true});

        console.log('Data deleted successfully')
        exit(0);
        
    } catch (error) {
        console.log(error);
        exit(1); 
    }
}

if (process.argv[2] === "-i") {
    getData();
}

if (process.argv[2] === "-e") {
    deleteData();
}