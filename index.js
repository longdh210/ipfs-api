// var express = require('express');
// var bodyParser = require('body-parser');
// var multer = require('multer');
var cookieParser = require('cookie-parser')
// var upload = multer();

// var app = express();
const port = 3000;

// app.use(cookieParser());
// app.use(bodyParser.json);
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(upload.array());

// var nfts = require('./nfts.js');

// app.use('/nfts', nfts);

// // app.get('/', (req, res) => {
// //     res.send('Hello World, from express');
// // });
var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

var app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());

//Require the Router we defined in movies.js
var nfts = require('./nfts.js');

//Use the Router on the sub route /movies
app.use('/nfts', nfts);

// app.listen(3000);

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))