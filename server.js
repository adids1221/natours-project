const mongoose = require('mongoose');
const dotenv = require('dotenv');

//Catching uncaughtException
process.on('uncaughtException', err => {
    (`UNHANDLED EXCEPTION! SHUTTING DOWN`);
    //(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: './config.env' });//environment settings
const app = require('./app');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    }).then(() => console.log(`DB connection successful!`));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`app runing on port ${port}...`);
});

//Handle all promises rejections
process.on('unhandledRejection', err => {
    console.log(`UNHANDLED REJECTION! SHUTTING DOWN`);
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM RECIVED, Shutting Down gracefully');
    server.close(() => {
        console.log('💥 Process terminated!')
    });
});