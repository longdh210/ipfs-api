const tokenaddress = "0x535a939aC42F70954FFd8204d384f56b032ddE0f";
const Token = require("../../Token.json");
const { ethers } = require("ethers");
const express = require("express");
const router = express.Router();
const axios = require("axios");
const pool = require("../db/postgre");
let nfts = [];

async function getToken() {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://speedy-nodes-nyc.moralis.io/12c36cfbdd209707bb91d9a7/bsc/testnet"
  );
  const tokenContract = new ethers.Contract(tokenaddress, Token.abi, provider);
  const data = await tokenContract.getTokenData();

  const items = await Promise.all(
    data.map(async (i) => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId);
      const meta = await axios.get(tokenUri);
      let item = {
        tokenId: i.tokenId.toNumber(),
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
        price: meta.data.price,
        addressOwner: meta.data.addressOwner,
        addressToken: meta.data.addressToken,
      };
      return item;
    })
  );
  return items;
  // nfts.push(items)
}

router.get("/", async function (req, res) {
  //const data = await getToken();
  const result = await pool.query("SELECT * FROM nft");

  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const { id, name, image, description, addressOwner } = req.body;
  try {
    console.log("run");
    const result = await pool.query(
      `INSERT INTO nft (id,name,image,description,addressowner) VALUES (${id},'${name}','${image}','${description}','${addressOwner}')`
    );
    res.send(result);
  } catch (e) {
    res.status(500).send();
    console.log(e);
  }
});

module.exports = router;
