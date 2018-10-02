# s3-disk-stats

Get s3 disk usage stats.

List s3 objects in bucket and fetch usage status.

## Install & Run

```sh
npm install
node index.js -b buvket-name
```

## Usage

```sh
usage: index.js [-h] [-v] [-b BUCKETNAME] [-a AWSACCOUNT] [-c CREDJSON]

S3 usage stats

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -b BUCKETNAME, --bucketname BUCKETNAME
                        S3 bucket name
  -a AWSACCOUNT, --awsaccount AWSACCOUNT
                        AWS shared account name
  -c CREDJSON, --credjson CREDJSON
                        AWS credential json path
```
