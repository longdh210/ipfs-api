const express = require("express");
const router = express.Router();
const Token = require("../../Token.json");
const ethers = require("ethers");
const axios = require("axios");
const tokenaddress = process.env.tokenaddress;

async function dataNFT(i, tokenContract) {
  const tokenUri = await tokenContract.tokenURI(i.tokenId);
  const meta = await axios.get(tokenUri);
  let item = {
    tokenId: i.tokenId.toNumber(),
    addressOwner: i.owner,
    image: meta.data.image,
    name: meta.data.name,
    // price: meta.data.price,
  };
  return item;
}

//get data nft
router.get("/dataNft", async function (req, res) {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc-mumbai.matic.today"
  );
  const tokenContract = new ethers.Contract(tokenaddress, Token.abi, provider);
  const data = await tokenContract.getTokenData();

  try {
    const result = [];
    //chuyen promise.all thanh vong lap for vi dung promise dinh loi 429: Too Request
    for (const item of data) {
      result.push(await dataNFT(item, tokenContract));
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

// router.post("/transferNFT", async function (req, res) {
//   const { tokenId, addressOwner, addressReiceiver } = req.body;
//   const provider = new ethers.providers.JsonRpcProvider(
//     "https://rpc-mumbai.matic.today"
//   );
//   const tokenContract = new ethers.Contract(tokenaddress, Token.abi, provider);

//   try {
//     //create token
//     let transaction = await tokenContract.transferNFT(
//       addressOwner,
//       addressReiceiver,
//       tokenId
//     );
//     await transaction.wait();
//     res.status(200).json();
//   } catch (error) {
//     res.status(404).json({ message: error.message });
//   }
// });

module.exports = router;
