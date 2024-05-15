
require('dotenv').config();
const AWS = require('aws-sdk');

const S3 = new AWS.S3({
credentials: {
    accessKeyId: process.env.S3_ACCESSKEYID,
    secretAccessKey: process.env.S3_SECRETACESSKEY,
    endpoint: process.env.S3_ENDPOINT
}
});
module.exports = S3;

