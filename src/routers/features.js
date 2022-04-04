const express = require("express");
const router = express.Router();
const Token = require("../../GAToken.json");
const ethers = require("ethers");
const axios = require("axios");
const tokenaddress = "0x5215b5e0991e80DC755435A8D6009832509a2628";
const Web3 = require("web3");
const { checkResultErrors } = require("ethers/lib/utils");
const web3 = new Web3("https://rpc-mumbai.matic.today");
// const PRIVATE_KEY = "d63f28afb8bbd50a7c733adca1a2028a63881bd21458f349e199a83093404a19";
// const caller = "0xD5B0Eb7d7a404054A93B760122983C5EC214d4AE"

async function dataNFT(i, tokenContract) {
  const tokenUri = await tokenContract.tokenURI(i.tokenId);
  const meta = await axios.get(tokenUri);
  let item = {
    tokenId: i.tokenId.toNumber(),
    addressOwner: i.owner,
    image: meta.data.image,
    name: meta.data.name,
    description: meta.data.description,
  };
  return item;
}

//get data nft
router.get("/", async function (req, res) {
  const { addressOwner } = req.body;
  const provider = new ethers.providers.JsonRpcProvider(
    "https://polygon-mumbai.g.alchemy.com/v2/1IISvtbO2J8Uz_s2akC4cdk9qm6rnrY0"
  );
  const tokenContract = new ethers.Contract(tokenaddress, Token.abi, provider);
  const data = await tokenContract.getTokenData();

  try {
    const result = [];
    const query = []
    //chuyen promise.all thanh vong lap for vi dung promise dinh loi 429: Too Request
    for (const item of data) {
      result.push(await dataNFT(item, tokenContract));
    }
    for(const item of result) {
      if(addressOwner == item.addressOwner) {
        query.push(item);
      }
    }
    res.status(200).json(query);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

const calcuGasFee = async (sender, private_key) => {
  var balance = await web3.eth.getBalance(sender);
  var balanceInEther = web3.utils.fromWei(balance.toString(), "ether");
  const contract = new web3.eth.Contract(Token.abi, tokenaddress);
  if (balanceInEther < 0.4) {
    let gasFee = 0.5 - balanceInEther;
    gasFee = web3.utils.toWei(`${gasFee}`, "ether");
    console.log("withdraw: ", gasFee);
    const tx = {
      from: sender,
      to: tokenaddress,
      gas: 500000,
      data: contract.methods
        .withdraw(
          gasFee
        )
        .encodeABI(),
    };
    const signPromise = await web3.eth.accounts.signTransaction(tx, private_key);
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
  } else {
    console.log("balance of user > 0.4");
  }
};

const transfer = async (sender, private_key, recipient, tokenId) => {
  const contract = new web3.eth.Contract(Token.abi, tokenaddress);
  const tx = {
    'from': sender,
    'to': tokenaddress,
    'gas': 500000,
    'data': contract.methods
      .transferNFT(
        sender,
        recipient,
        tokenId
      )
      .encodeABI(),
  };

  const signPromise = await web3.eth.accounts.signTransaction(tx, private_key);
  await web3.eth.sendSignedTransaction(
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
  calcuGasFee(sender, private_key);
};

router.post("/:id", async function (req, res) {
  const id = parseInt(req.params.id);
  const { sender, private_key, recipient } = req.body;
  try {
    transfer(sender, private_key, recipient, id);
    res.status(200).json("ok");
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

module.exports = router;
