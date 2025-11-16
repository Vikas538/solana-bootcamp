import { createNft,fetchDigitalAsset,mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

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

await transaction.sendAndConfirm(umi)

const createdCollectionNft = await fetchDigitalAsset(umi,collectionMint.publicKey)

console.log(`createdCollectionNft  address is ${getExplorerLink("address",createdCollectionNft.mint.publicKey,"devnet")}`)