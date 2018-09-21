const { ArgumentParser } = require('argparse');
const { version } = require('./package.json');

const parser = new ArgumentParser({
    version: version,
    addHelp: true,
    description: 'S3 usage stats'
});

parser.addArgument(
    ['-b', '--bucketname'],
    {
        help: 'S3 bucket name'
    }
);

parser.addArgument(
    ['-a', '--awsaccount'],
    {
        help: 'AWS shared account name',
        defaultValue: 'default',
    }
);

parser.addArgument(
    ['-c', '--credjson'],
    {
        help: 'AWS credential json path'
    }
);


const args = parser.parseArgs();
module.exports = args;