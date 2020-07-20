/* eslint-disable @typescript-eslint/no-var-requires */

const AWS = require("aws-sdk");

const profile = "try-aws";

const credentials = new AWS.SharedIniFileCredentials({ profile });
AWS.config.credentials = credentials;
AWS.config.getCredentials((err) => {
  if (err) {
    handleError(err);
    return;
  }

  if (!AWS.config.credentials) {
    handleError(new Error("Credentials are empty"));
    return;
  }

  console.log("accessKeyId:", AWS.config.credentials.accessKeyId);
});

/**
 * @param {unknown} error
 */
function handleError(error) {
  console.error(error);
}
