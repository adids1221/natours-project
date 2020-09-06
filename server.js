const dotenv = require('dotenv');
dotenv.config({path: './config.env'});//environment settings
const app = require('./app');

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`app runing on port ${port}...`);
});