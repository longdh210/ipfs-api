using Solnet.Wallet;
using Solnet.Rpc;
using System.Text;
using Solana.Metaplex;
using Newtonsoft.Json;
using Solnet.Rpc.Models;

namespace NFTServicesLibrary;





public class NFTServices
{

    static private String TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
    static private String METADATA_PROGRAM = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
    static private String METADATA_PREFIX = "metadata";
    static private PublicKey metaProgramPublicKey = new PublicKey(METADATA_PROGRAM);
    static private byte[] metaProgamPublicKeyBuffer = metaProgramPublicKey.KeyBytes;
    static private byte[] metaProgamPrefixBuffer = Encoding.UTF8.GetBytes(METADATA_PREFIX);


    static private PublicKey getSolanaMetadataAddress(PublicKey tokenMint)
    {
        var seeds = new[]
        {
        metaProgamPrefixBuffer,
        metaProgamPublicKeyBuffer,
        tokenMint.KeyBytes,
        };

        PublicKey address;
        byte bump;
        var result = PublicKey.TryFindProgramAddress(seeds, metaProgramPublicKey, out address, out bump);
        return address;

    }
    static private void sanitizeAccountInfo(MetadataAccount account)
    {
        account.data.name = account.data.name.Replace("\u0000", "");
        account.data.uri = account.data.uri.Replace("\u0000", "");
        account.data.symbol = account.data.symbol.Replace("\u0000", "");

    }
    static private IEnumerable<List<T>> SplitList<T>(List<T> locations, int nSize = 30)
    {
        for (int i = 0; i < locations.Count; i += nSize)
        {
            yield return locations.GetRange(i, Math.Min(nSize, locations.Count - i));
        }
    }
    static public async Task<List<String>> getParsedNftAccountsByOwner(
        String publicAddress,
        bool sort = true,
        Cluster network = Cluster.DevNet,
        int limit = 5000
    )
    {
        var rpcClient = ClientFactory.GetClient(network);

        // Get all accounts owned by user
        // and created by SPL Token Program
        // this will include all NFTs, Coins, Tokens, etc.
        var wrappedSolAccounts = rpcClient.GetTokenAccountsByOwner(publicAddress, null, TOKEN_PROGRAM
        ).Result.Value;


        // We assume NFT is SPL token with decimals == 0 and amount at least 1
        // At this point we filter out other SPL tokens, like coins e.g.
        // Unfortunately, this method will also remove NFTы created before Metaplex NFT Standard
        // like Solarians e.g., so you need to check wallets for them in separate call if you wish
        var nftAccounts = Array.ConvertAll(wrappedSolAccounts.Where(
            (t, _) =>
            {
                var amount = Double.Parse(t.Account.Data.Parsed.Info.TokenAmount.UiAmountString);
                var decimals = t.Account.Data.Parsed.Info.TokenAmount.Decimals;
                return decimals == 0 && amount >= 1;
            }
        ).ToArray(), (Solnet.Rpc.Models.TokenAccount item) =>
        {
            var address = item.Account.Data.Parsed.Info.Mint;
            return new PublicKey(address);
        });
        PublicKey[] accountsSlice;
        if (limit > nftAccounts.Count())
        {
            accountsSlice = nftAccounts;
        }
        else
        {
            accountsSlice = nftAccounts[0..limit];
        }


        // Get Addresses of Metadata Account assosiated with Mint Token
        // This info can be deterministically calculated by Associated Token Program
        var metadataAcountsAddreses = Array.ConvertAll(accountsSlice,
            (item) => getSolanaMetadataAddress(item)
            );


        var metadataAccounts = metadataAcountsAddreses.Where((item, _) =>
        {
            return item != null;
        }).ToArray();


        // Fetch Found Metadata Account data by chunks
        var metadataAccountsByChunks = SplitList<PublicKey>(metadataAccounts.ToList(), 99);
        var taskResult = await Task.WhenAll(
            metadataAccountsByChunks.Select(
                (chunk) => rpcClient.GetMultipleAccountsAsync(chunk.Select((it) => it.Key).ToArray())
                )
        );
        var metaAccountsRawMetaResult = new List<AccountInfo>();
        foreach (var item in taskResult)
        {
            metaAccountsRawMetaResult.AddRange(item.Result.Value);
        }
        var accountsRawMeta = metaAccountsRawMetaResult;

        // There is no reason to continue processing
        // if Mints doesn't have associated metadata account. just return []
        if (accountsRawMeta.Count() == 0)
        {
            return new List<String>();
        }

        // Decode data from Buffer to readable objects
        var accountsDecodedMeta =
          accountsRawMeta.Select((accountInfo) =>
          {
              var data = new MetadataAccount(accountInfo);
              sanitizeAccountInfo(data);
              return data;

          }
          ).Where(item =>
              item.data.uri != "" && item.data.uri != null
          ).ToArray();

        if (sort)
        {
            accountsDecodedMeta.OrderBy(q => q.updateAuthority.Key);
        }
        List<String> result = Array.ConvertAll(accountsDecodedMeta, (item) =>
        {
            var json = JsonConvert.SerializeObject(item);
            return json;
        }).ToList();


        return result;
    }

}
