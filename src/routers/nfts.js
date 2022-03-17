const { ethers } = require("ethers");
const express = require("express");
const router = express.Router();
const axios = require("axios");
const pool = require("../db/postgre");
const { response } = require("express");
const pinJSONToIPFS = require("../middleware/pinata");

const PUBLIC_KEY = "0x80e7e19d5950121304a2a4D265582a05cF2099f3";
const PRIVATE_KEY =
  "da2117b83749a891fc6017bdaa34f2fd6a8d0581a335921ae80e40e95aa4e1b6";
var Web3 = require("web3");
var web3 = new Web3(
  "https://rpc-mumbai.matic.today"
);
const tokenaddress = "0x104d252564731a240d3fb5Dbc13F3F6029831836";
const Token = require("../../Token.json");
const tokenContract = new web3.eth.Contract(Token.abi, tokenaddress);

//withdraw || mint nft
const mintToken = async (tokenId, recipdent, tokenURI) => {
  const nonce = await web3.eth.getTransactionCount(PUBLIC_KEY, "latest"); //get latest nonce
  //the transaction
  const tx = {
    from: PUBLIC_KEY,
    to: tokenaddress,
    nonce: nonce,
    gas: 500000,
    data: tokenContract.methods
      .mintNFT(tokenId, recipdent, tokenURI)
      .encodeABI(),
  };
  const signPromise = web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
  signPromise
    .then((signedTx) => {
      web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (err, hash) {
          if (!err) {
            console.log(
              "The hash of your transaction is: ",
              hash
              // "\nCheck Alchemy's Mempool to view the status of your transaction!"
            );
          } else {
            console.log(
              "Something went wrong when submitting your transaction:",
              err
            );
          }
        }
      );
    })
    .catch((err) => {
      console.log(" Promise failed:", err);
    });
};

router.get("/", async function (req, res) {
  //const data = await getToken();
  const ownerAddress = req.query.ownerAddress;
  const result = await pool.query("SELECT * FROM nft WHERE addressowner = $1", [
    ownerAddress,
  ]);

  res.json(result.rows);
});

router.get("/:id", async function (req, res) {
  try {
    const id = parseInt(req.params.id);
    //const data = await getToken();
    const result = await pool.query("SELECT * FROM nft WHERE id = $1", [id]);
    if (result.rows.length == 0) {
      throw `No NFT found with id ${id}`;
    }
    res.json(result.rows);
  } catch (e) {
    res.status(404).send({
      error: e.toString(),
    });
  }
});

router.post("/", async (req, res) => {
  const { id, name, image, description, addressOwner } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO nft (id,name,image,description,addressowner) 
      VALUES ($1,$2,$3,$4,$5)
      RETURNING id,name,image,description,addressowner;
      `,
      [id, name, image, description, addressOwner]
    );
    res.send(result.rows);
  } catch (e) {
    res.status(500).send({
      error: e.toString(),
    });
    console.log(e);
  }
});

router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { addressOwner } = req.body;
  try {
    const result = await pool.query(
      `UPDATE nft Set addressowner = $1 WHERE id = $2`,
      [addressOwner, id]
    );
    res.status(200).send(`User modified with ID: ${id}`);
  } catch (e) {
    res.status(500).send();
    console.log(e);
  }
});

//withdraw nft then delete data
router.delete("/:id", async function (req, res) {
  const id = parseInt(req.params.id);
  const { addressWithdraw } = req.body;
  //get data of nft
  let result = await pool.query("SELECT * FROM nft WHERE id = $1", [id]);
  //make metadata
  const metadata = new Object();
  metadata.name = result.rows[0].name;
  metadata.description = result.rows[0].description;
  metadata.image = result.rows[0].image;

  try {
    //make pinata call
    const pinataResponse = await pinJSONToIPFS(metadata);
    if (!pinataResponse.success) {
      return {
        success: false,
        status: "😢 Something went wrong while uploading your tokenURI.",
      };
    }
    const tokenURI = pinataResponse.pinataUrl;
    console.log("TokenURI: ", tokenURI);

    //withdraw nft || mint
    mintToken(id, addressWithdraw, tokenURI);
  } catch (error) {
    console.log("Error uploading file: ", error);
  }

  //delete data in database
  result = await pool.query("DELETE FROM nft where id = $1", [id]);
  res.status(200).send(`User deleted with ID: ${id}`);
});

module.exports = router;
