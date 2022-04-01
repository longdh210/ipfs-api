const express = require("express");
const router = express.Router();
const Token = require("../../GAToken.json");
const ethers = require("ethers");
const axios = require("axios");
const tokenaddress = process.env.tokenaddress;
// import Web3Modal from "web3modal";
// import Web3 from "web3";
// // import { useNavigate } from 'react-router-dom';
// import Web3EthContract from "web3-eth-contract";
// const Web3Modal = require("web3modal");
const Web3 = require("web3");
const web3 = new Web3("https://rpc-mumbai.matic.today");
const Web3EthContract = require("web3-eth-contract");
const PRIVATE_KEY = process.env.PRIVATE_KEY;

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

const calcuGasFee = async (caller, tokenaddress) => {
  var balance = await web3.eth.getBalance(caller);
  var balanceInEther = web3.utils.fromWei(balance.toString(), "ether");
  if (balanceInEther < 0.4) {
    let gasFee = 0.5 - balanceInEther;
    gasFee = web3.utils.toWei(`${gasFee}`, "ether");
    console.log("withdraw: ", gasFee);
    // const contract = new ethers.Contract(tokenaddress, Token.abi, provider);
    const contract = new Web3EthContract(Token.abi, tokenaddress);
    contract.methods.withdraw(gasFee).send({
      from: caller,
      gasPrice: "40000000000",
    });
  } else {
    console.log("balance of user > 0.4");
  }
};
const transfer = async (recipient, tokenId) => {
  // const provider = new ethers.providers.JsonRpcProvider(
  //   "https://rpc-mumbai.matic.today"
  // );
  var caller = "0xfc704cb253a586a6539f29705ecc5faeea3e2fb3";
  const contract = new web3.eth.Contract(Token.abi, tokenaddress);
  const tx = {
    from: caller,
    to: tokenaddress,
    gas: 500000,
    gasPrice: "40000000000",
    data: contract.methods
      .transferNFT(
        "0xFc704cB253A586A6539f29705ecC5FAeEa3e2FB3",
        recipient,
        tokenId
      )
      .encodeABI(),
  };

  const signPromise = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
  web3.eth.sendSignedTransaction(
    signPromise.rawTransaction,
    function (err, hash) {
      if (!err) {
        console.log("The hash of your transaction is: ", hash);
      } else {
        console.log(
          "Something went wrong when submitting your transaction:",
          err
        );
      }
    }
  );
};
router.post("/transferNFT", async function (req, res) {
  const { recipient, tokenId } = req.body;
  try {
    var caller = "0xfc704cb253a586a6539f29705ecc5faeea3e2fb3";
    transfer(recipient, tokenId);
    await calcuGasFee(caller, tokenaddress);
    res.status(200).json("ok");
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;
