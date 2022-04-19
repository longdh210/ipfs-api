const express = require("express");
const router = express.Router();
const axios = require("axios");
const { clusterApiUrl, Connection, PublicKey } = require("@solana/web3.js");
const { getParsedNftAccountsByOwner } = require("@nfteyez/sol-rayz");
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
router.get("/sol/:address", async (req, res) => {
  const publicKey = req.params.address;
  const nfts = await getParsedNftAccountsByOwner({
    publicAddress: publicKey,
    connection: connection,
  });
  res.json(nfts);
});

module.exports = router;
