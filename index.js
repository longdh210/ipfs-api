var cookieParser = require("cookie-parser");

const port = process.env.PORT || 3000;

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());

const NFT = require("./src/routers/features.js");

app.use("/nft", NFT);

app.listen(port, () => console.log(`NFT app listening on port ${port}!`));
