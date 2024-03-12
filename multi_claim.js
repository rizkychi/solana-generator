import moment from "moment";
import fs from "fs";
import fetch from "node-fetch";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import base58 from 'bs58'
import pkg from "tweetnacl-util";
const {decodeUTF8} = pkg;

const mains = async (secrets) => {
  try {
    const keypair = Keypair.fromSecretKey(base58.decode(secrets));

    console.log('Public address: ', keypair.publicKey.toString());

    // create signature
    const dates = moment().unix();
    const message = "sign in"+dates;
    const messageBytes = decodeUTF8(message);

    const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
    const result = nacl.sign.detached.verify(
        messageBytes,
        signature,
        keypair.publicKey.toBytes()
    );

    // sign in user
    const body = {
        "sign": Buffer.from(signature).toString('hex'),
        "address": keypair.publicKey.toString(),
        "timestamp": dates
    }
    const response = await fetch('https://api.v-token.io/api/points/sign', {
        method: 'post',
        body: JSON.stringify(body),
        headers: {'Content-Type': 'application/json'}
    });

    const data = await response.json();

    console.log('Sign user: ', data.msg);
  } catch (error) {
    console.log(error)
  }
}

// mains();

var files = fs.readFileSync("./address_secret.txt").toString();
var addrs = files.split("\n");

addrs.forEach(el => {
    mains(el);
});