const fs = require('fs');
const async = require('async');
const { S3 } = require('./config/aws.js');

const { bucketname } = require('./argparser');

const REPORT = {};

function listBuckets() {
    const params = {
    };
    return new Promise((resolve, reject) => {
        S3.listBuckets(params, function (err, data) {
            return err ? reject(err) : resolve(data);
        });
    });
}

function listObjects(BucketName, ContinuationToken) {
    const params = {
        Bucket: BucketName
    };
    if (ContinuationToken) params.ContinuationToken = ContinuationToken;

    return new Promise((resolve, reject) => {
        S3.listObjectsV2(params, function (err, data) {
            return err ? reject(err) : resolve(data);
        });
    });
}

function computeStats(BucketName, contents) {
    if (!REPORT[BucketName]) {
        REPORT[BucketName] = {
            dataUsed: 0,
            objectCount: 0
        };
    }
    REPORT[BucketName].objectCount += contents.length;
    for (let object of contents) {
        REPORT[BucketName].dataUsed += object.Size;
    }
}

async function main(BucketName, ContinuationToken) {
    let objects = await listObjects(BucketName, ContinuationToken);
    computeStats(BucketName, objects.Contents);
    console.log(REPORT);
    if (objects.NextContinuationToken) {
        await main(BucketName, objects.NextContinuationToken);
        return true;
    } else {
        return true;
    }
}

if (bucketname) {
    process.nextTick(async () => {
        await main(bucketname);
        let _date = new Date().toISOString();
        fs.writeFileSync(`./report-${_date}.json`, JSON.stringify(REPORT));
    });
} else {
    process.nextTick(async () => {
        const buckets = await listBuckets();
        async.eachOfLimit(buckets.Buckets, 5, function (item, key, callback) {
            process.nextTick(async () => {
                try {
                    await main(item.Name);
                    return callback();
                } catch (error) {
                    console.error(error);
                    return callback();
                }
            });
        }, function () {
            console.log("All done");
            let _date = new Date().toISOString();
            fs.writeFileSync(`./report-${_date}.json`, JSON.stringify(REPORT));
        });
    });
}