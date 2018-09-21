const AWS = require('aws-sdk');
const { credjson, awsaccount } = require('../argparser');
AWS.config.maxRetries = 20;

if (credjson) {
    AWS.config.loadFromPath(credjson.replace('~', process.env.HOME));
} else {
    const credentials = new AWS.SharedIniFileCredentials({ profile: awsaccount });
    AWS.config.credentials = credentials;
}

const S3 = new AWS.S3();

module.exports = {
    S3
};