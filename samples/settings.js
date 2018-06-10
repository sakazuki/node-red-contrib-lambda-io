
module.exports = {
    uiPort: process.env.PORT || 1880,
    functionGlobalContext: { },
    awsRegion: process.env.AWS_REGION,
    awsS3Bucket: process.env.S3_BUCKET,
    awsS3Appname: process.env.AWS_LAMBDA_FUNCTION_NAME,
    storageModule: require('node-red-contrib-storage-s3'),
    credentialSecret: process.env.NODE_RED_SECRET || "a-secret-key"
};
