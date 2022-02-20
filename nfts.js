const tokenaddress = "0xd0EC5c3978F11013F5e9e3FFDe565988F3267636"
const Token = require('./Token.json')
const { ethers } = require('ethers')
var express = require('express')
var router = express.Router()
var axios = require('axios')
let nfts = []

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
            price: meta.data.price,
            addressOwner: meta.data.addressOwner,
            addressToken: meta.data.addressToken,
        }
        return item
    }))
    return items
    // nfts.push(items)
}
const data = getToken()
data.then(function (result) {
    console.log(result)
    router.get('/', function (req, res) {
        res.json(result)
    })
})
// .then(function () {
//     router.get('/', function (req, res) {
//         nfts
//     })
// })
module.exports = router;
