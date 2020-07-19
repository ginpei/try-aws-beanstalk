/* eslint-disable @typescript-eslint/no-var-requires */

const express = require("express");

require("dotenv").config();

const port = process.env.PORT;
if (!port) {
  throw new Error("Port must be set as environment var or in .env file");
}

const app = express();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => process.stdout.write(`Listening at ${port}\n`));
