
using NFTServicesLibrary;
using Newtonsoft.Json;
using System.Net;
using Solnet.Rpc;
///Usage
///Library file: NFTServicesLibrary.dll
///requirement: install solnet.rpc, solana.metaplex, newtonsoft.json

var walletAddress = "d9dkhShP3JJqkMkX9gYzwjqdgQ9iWMFRhdKe9vBP5tH";
/// Returns List<String>, each element is an serialized json object 
///see example_response.json for response detail
var nfts = NFTServices.getParsedNftAccountsByOwner(walletAddress, network: Cluster.DevNet, limit: 20).GetAwaiter().GetResult();


foreach (var item in nfts)
{
    var nft = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(item);

    //get nft's image url
    var metaDataUri = nft["data"]["uri"].ToString();
    var nftMetadataRaw = Get(metaDataUri);
    var nftMetadata = JsonConvert.DeserializeObject<Dictionary<string, dynamic>>(nftMetadataRaw);
    Console.WriteLine("NFT image Url: " + nftMetadata["image"].ToString());
}





string Get(string uri)
{
    HttpWebRequest request = (HttpWebRequest)WebRequest.Create(uri);
    request.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;

    using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
    using (Stream stream = response.GetResponseStream())
    using (StreamReader reader = new StreamReader(stream))
    {
        return reader.ReadToEnd();
    }
}
///