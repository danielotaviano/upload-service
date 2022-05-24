const express = require('express');
const fs = require('fs')
const { s3 } = require('./s3');
const _ = require('lodash')

const app = express();
app.use(express.json())



app.get('/', (req, res) => {
  return res.sendFile(__dirname + '/index.html')
})

app.post('/uploads/init', async (req, res) => {
  const { name } = req.body;

  const multipartParams = {
    Bucket: "upload-multipart-test",
    Key: `${name}`,
    ACL: 'public-read'
  }

  const multipartUpload = await s3
    .createMultipartUpload(multipartParams)
    .promise();

  console.log(multipartUpload)

  return res.end(JSON.stringify({
    fileId: multipartUpload.UploadId,
    fileKey: multipartUpload.Key
  }));
})

app.post('/uploads/getUrls', async (req, res) => {
  const { fileKey, fileId, parts } = req.body

  const multipartParams = {
    Bucket: "upload-multipart-test",
    Key: fileKey,
    UploadId: fileId,
  }

  const promises = []

  for (let index = 0; index < parts; index++) {
    promises.push(
      s3.getSignedUrlPromise("uploadPart", {
        ...multipartParams,
        PartNumber: index + 1,
      }),
    )
  }

  const signedUrls = await Promise.all(promises)

  const partSignedUrlList = signedUrls.map((signedUrl, index) => {
    return {
      signedUrl: signedUrl,
      PartNumber: index + 1,
    }
  })

  res.send({
    parts: partSignedUrlList,
  })
})

app.post('/uploads/finish', async (req, res) => {
  const { fileId, fileKey, parts } = req.body

  const multipartParams = {
    Bucket: "upload-multipart-test",
    Key: fileKey,
    UploadId: fileId,
    MultipartUpload: {
      // ordering the parts to make sure they are in the right order
      Parts: _.orderBy(parts, ["PartNumber"], ["asc"]),
    },
  }

  const response = await s3.completeMultipartUpload(multipartParams).promise()

  res.json({
    url: response.Location,
  })
})


app.listen(3000);