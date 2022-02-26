const axios = require('axios')

const key = '808e178a020cc1ef6216'
const secret = 'c101b76b799e6959268b6a338ec07f9b00632891005aea69696dd153641b3896'


const pinJSONToIPFS = async(JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    //making axios POST request to Pinata
    return axios.post(url, JSONBody, {
        headers: {
            pinata_api_key: key,
            pinata_secret_api_key: secret,
        }
    }).then(function(response) {
        return {
            success: true,
            pinataUrl: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
        }
    }).catch(function(error) {
        console.log(error)
        return {
            success: false,
            message: error.message,
        }
    })
}

module.exports = pinJSONToIPFS