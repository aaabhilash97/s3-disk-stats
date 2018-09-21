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
    contents = null;
    global.gc && global.gc();
}

async function main(BucketName, ContinuationToken) {
    let objects = await listObjects(BucketName, ContinuationToken);
    computeStats(BucketName, objects.Contents);
    const NextContinuationToken = objects.NextContinuationToken;
    objects = null;
    global.gc && global.gc();
    process.stdout.write(".");
    if (NextContinuationToken) {
        await main(BucketName, NextContinuationToken);
        return true;
    } else {
        console.log(REPORT);
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
        async.eachOfLimit(buckets.Buckets, 5, async function (item) {
            await main(item.Name);
            return;
        }, function () {
            console.log("All done");
            let _date = new Date().toISOString();
            fs.writeFileSync(`./report-${_date}.json`, JSON.stringify(REPORT));
        });
    });
}