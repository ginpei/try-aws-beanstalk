/* eslint-disable @typescript-eslint/no-var-requires */

const express = require("express");

const port = process.env.PORT || 3000;
const app = express();

app.get("/", (req, res) => {
  res.send(`Hello World from ${port}!`);
});

app.listen(port, () => process.stdout.write(`Listening at ${port}\n`));
