import moment from "moment";
import fs from "fs";
import fetch from "node-fetch";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import base58 from 'bs58'
import pkg from "tweetnacl-util";
const {decodeUTF8} = pkg;
const invite_code = "2qe6hy";

const mains = async () => {
  const keypair = Keypair.generate();

  // claim invite
  var body = {
    "invite_code": invite_code,
    "address": keypair.publicKey.toString()
  }
  var response = await fetch('https://api.v-token.io/api/points/invite', {
    method: 'post',
    body: JSON.stringify(body),
    headers: {'Content-Type': 'application/json'}
  });

  var data = await response.json();

  console.log('Public address: ', keypair.publicKey.toString());
  console.log('Claim invite code: ', data.msg);

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
  body = {
    "sign": Buffer.from(signature).toString('hex'),
    "address": keypair.publicKey.toString(),
    "timestamp": dates
  }
  response = await fetch('https://api.v-token.io/api/points/sign', {
    method: 'post',
    body: JSON.stringify(body),
    headers: {'Content-Type': 'application/json'}
  });

  data = await response.json();

  console.log('Sign user: ', data.msg);
  
  if (data.code == 200) {
    fs.appendFile('address_secret.txt', base58.encode(keypair.secretKey) + "\n", function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
  }
}

async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise(resolve => setTimeout(resolve, ms));
}

let run = async ()=>{
  while (true) {
    mains();
    await delay(2000);
  }
}
run();