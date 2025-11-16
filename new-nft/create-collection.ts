import { createNft,fetchDigitalAsset,mplTokenMetadata, DigitalAsset } from "@metaplex-foundation/mpl-token-metadata";

import { airdropIfRequired,getExplorerLink,getKeypairFromFile } from "@solana-developers/helpers";
import {generateSigner, keypairIdentity, percentAmount} from "@metaplex-foundation/umi"

import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {clusterApiUrl, Connection,LAMPORTS_PER_SOL} from "@solana/web3.js"

const connection = new Connection(clusterApiUrl("devnet"))

const user = await getKeypairFromFile()

await airdropIfRequired(connection,user.publicKey,1*LAMPORTS_PER_SOL,0.5*LAMPORTS_PER_SOL)

console.log("Loaded solana publoc key",user.publicKey.toBase58())

const umi = createUmi(connection.rpcEndpoint)
umi.use(mplTokenMetadata())

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey)
umi.use(keypairIdentity(umiUser))

const collectionMint = generateSigner(umi);

const transaction = await createNft(umi,{
    mint:collectionMint,
    name:"vicky's collection",
    symbol:"VKY",
    uri:"https://raw.githubusercontent.com/Vikas538/token-command-line/main/nft.json",
    sellerFeeBasisPoints:percentAmount(0),
    isCollection:true

})

console.log("Sending transaction...")
try {
  const result = await transaction.sendAndConfirm(umi)
  console.log("Transaction confirmed:", result)
} catch (error) {
  console.error("Transaction failed:", error)
  throw error
}

// Wait for account finalization
console.log("Waiting for account finalization...")
await new Promise(resolve => setTimeout(resolve, 5000))

let retries = 0
let createdCollectionNft: DigitalAsset | null = null
while (retries < 10) {
  try {
    console.log(`Fetching digital asset (attempt ${retries + 1}/10)...`)
    createdCollectionNft = await fetchDigitalAsset(umi, collectionMint.publicKey)
    console.log("Successfully fetched digital asset!")
    break
  } catch (error) {
    retries++
    if (retries >= 10) throw error
    console.log(`Failed to fetch, retrying in 3 seconds...`)
    await new Promise(resolve => setTimeout(resolve, 3000))
  }
}

if (!createdCollectionNft) {
  throw new Error("Failed to fetch created collection NFT after multiple retries")
}

console.log(`createdCollectionNft  address is ${getExplorerLink("address",createdCollectionNft.mint.publicKey,"devnet")}`)