const AWS = require('aws-sdk');

const s3EndPoint = new AWS.Endpoint('https://s3.us-west-2.amazonaws.com');

const s3Credentials = new AWS.Credentials({
  accessKeyId:'',
  secretAccessKey:''
})

const s3 = new AWS.S3({
  endpoint: s3EndPoint,
  credentials: s3Credentials,
})

module.exports = { s3 }

