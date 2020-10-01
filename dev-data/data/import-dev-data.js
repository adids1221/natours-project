const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');
dotenv.config({ path: './config.env' });//environment settings

const DB = process.env.DATABASE.replace('<PASSWORD>',
    process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }).then(() => console.log(`DB connection successful!`));

//read json file
const tours = JSON.parse(fs.readFileSync(
    `${__dirname}/tours.json`, 'utf-8'));

const users = JSON.parse(fs.readFileSync(
    `${__dirname}/users.json`, 'utf-8'));

const reviews = JSON.parse(fs.readFileSync(
    `${__dirname}/reviews.json`, 'utf-8'));

//import data into database
const importData = async () => {
    try {
        await Tour.create(tours); //reading the arr and create new obnject over each cell
        await User.create(users, { validateBeforeSave: false});
        await Review.create(reviews, { validateBeforeSave: false});
        console.log(`Data successfully loaded`);
    } catch (err) {
        console.log(err);
    }
    process.exit()
}

//delete all data from collection 
const deleteData = async () => {
    try {
        await Tour.deleteMany(); //delete all the collection
        await User.deleteMany();
        await Review.deleteMany();
        console.log(`Data successfully deleted`);
    } catch (err) {
        console.log(err);
    }
    process.exit()
}

if (process.argv[2] === `--import`) {
    importData()
} else if (process.argv[2] === `--delete`) {
    deleteData()
}


