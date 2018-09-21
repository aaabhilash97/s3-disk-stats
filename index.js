const fs = require('fs');
const { S3 } = require('./config/aws.js');

const { bucketname } = require('./argparser');
const BucketName = bucketname;

const REPORT = {
    dataUsed: 0,
    objectCount: 0
};

function listObjects(ContinuationToken) {
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

function computeStats(contents) {
    REPORT.objectCount += contents.length;
    for (let object of contents) {
        REPORT.dataUsed += object.Size;
    }
}

async function main(ContinuationToken) {
    let objects = await listObjects(ContinuationToken);
    computeStats(objects.Contents);
    console.log(REPORT);
    if (objects.NextContinuationToken) {
        main(objects.NextContinuationToken);
    } else {
        let _date = new Date().toISOString();
        fs.writeFileSync(`./report-${_date}.json`, JSON.stringify(REPORT));
    }
}


main();