/* eslint-disable @typescript-eslint/no-var-requires */

const AWS = require("aws-sdk");

const profile = "try-aws";

const credentials = new AWS.SharedIniFileCredentials({ profile });
AWS.config.credentials = credentials;

const s3 = new AWS.S3({ apiVersion: "2006-03-01" });

main().catch((v) => handleError(v));

async function main() {
  const bucketName = `x-s3-example`;
  const keyName = "hello-world.txt";

  console.log(`Target: S3 > ${bucketName} > ${keyName}`);

  console.log("(1/2) create bucket");
  /** @type {AWS.S3.CreateBucketRequest} */
  const options = { Bucket: bucketName };
  await s3.createBucket(options).promise();

  console.log("(2/2) put a text file into the bucket");
  /** @type {AWS.S3.PutObjectRequest} */
  const request = {
    Bucket: bucketName,
    Key: keyName,
    Body: "Hello World!",
  };
  await s3.putObject(request).promise();

  console.log("Done!");
}

/**
 * @param {unknown} error
 */
function handleError(error) {
  console.error(error);
}
