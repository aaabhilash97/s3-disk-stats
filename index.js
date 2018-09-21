'use strict';
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
    const NextContinuationToken = objects.NextContinuationToken;
    console.clear();
    console.log(REPORT);
    return NextContinuationToken;
}

if (bucketname) {
    setTimeout(async () => {
        let next = await main(bucketname);
        while (next) {
            next = await main(bucketname, next);
        }
        let _date = new Date().toISOString();
        fs.writeFileSync(`./report-${_date}.json`, JSON.stringify(REPORT));
    });
} else {
    process.nextTick(async () => {
        const buckets = await listBuckets();
        async.eachOfLimit(buckets.Buckets, 5, async function (item) {
            let next = await main(item.Name);
            while (next) {
                next = await main(item.Name, next);
            }
            return;
        }, function () {
            console.log("All done");
            let _date = new Date().toISOString();
            fs.writeFileSync(`./report-${_date}.json`, JSON.stringify(REPORT));
        });
    });
}