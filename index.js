var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var cookieParser = require('cookie-parser')
var upload = multer();

var app = express();

app.use(cookieParser());
app.use(bodyParser.json);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());

var nfts = require('./nfts.js');
app.use('/nfts', nfts);

app.listen(3000);