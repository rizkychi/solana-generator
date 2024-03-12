import { Keypair } from "@solana/web3.js";
import base58 from 'bs58'

const keypair = Keypair.generate();

console.log("Public Key: ", keypair.publicKey.toString());
console.log("Secret: ",base58.encode(keypair.secretKey))