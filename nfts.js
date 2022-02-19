const tokenaddress = "0xb81239EE648B1eB77BE168CEc6d9a7B06ebC7e7c"
const Token = require('./Token.json')
const { ethers } = require('ethers')
var express = require('express')
var router = express.Router()
var axios = require('axios')
const nfts = []

async function getToken() {
    const provider = new ethers.providers.JsonRpcProvider("https://speedy-nodes-nyc.moralis.io/12c36cfbdd209707bb91d9a7/bsc/testnet")
    const tokenContract = new ethers.Contract(tokenaddress, Token.abi, provider)
    const data = await tokenContract.getTokenData()

    const items = await Promise.all(data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let item = {
            tokenId: i.tokenId.toNumber(),
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
        }
        return item
    }))
    nfts.push(items)
}
getToken()
router.get('/', function (req, res) {
    res.json(nfts)
})
module.exports = router;
