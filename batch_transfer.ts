import fs from "fs";
import {
  Account,
  AccountAddress,
  Aptos,
  AptosConfig,
  Ed25519PrivateKey,
  MoveVector,
} from "@aptos-labs/ts-sdk";
import { Network } from "aptos";

// Config
const BATCH_SIZE = 100;
const SENDER_PRIVATE_KEY = "";
const COIN = "";

const aptos = new Aptos(new AptosConfig({ network: Network.MAINNET }));

async function main() {
  const addresses: string[] = [];
  const amounts: number[] = [];

  const data = await fs.readFileSync("addresses.csv", "utf8");
  const lines = data.split("\n");
  for (let i = 1; i < lines.length; i++) {
    const columns = lines[i].split(",");
    const account = columns[0];
    const guiAmount = parseFloat(columns[3]);
    if (account) {
      addresses.push(account);
    }
    if (!isNaN(guiAmount)) {
      amounts.push(guiAmount);
    }
  }

  console.log(`# of Addresses: ${addresses.length}`);

  const sender = await Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(SENDER_PRIVATE_KEY),
  });

  for (let i = 0; i < addresses.length; i += BATCH_SIZE) {
    const batchAddresses = addresses.slice(i, i + BATCH_SIZE);
    const batchAccountAddresses = batchAddresses.map((address) =>
      AccountAddress.fromString(address),
    );
    const batchAmounts = amounts.slice(i, i + BATCH_SIZE);
    await batchTransferCoins(sender, COIN, batchAccountAddresses, batchAmounts);

    const percentage = (i / addresses.length) * 100;
    const progressBar =
      "=".repeat(i / 50) + " ".repeat(addresses.length / 50 - i / 50);
    console.log(`Progress: [${progressBar}] ${percentage.toFixed(2)}%`);
  }
}

async function batchTransferCoins(
  sender: Account,
  coin: string,
  recipients: AccountAddress[],
  amounts: number[],
) {
  const transaction = await aptos.transaction.build.simple({
    sender: sender.accountAddress,
    data: {
      function: "0x1::aptos_account::batch_transfer_coins",
      typeArguments: [coin],
      functionArguments: [new MoveVector(recipients), MoveVector.U64(amounts)],
    },
  });
  const signedTxn = await aptos.transaction.sign({
    signer: sender,
    transaction,
  });
  const transactionResponse = await aptos.transaction.submit.simple({
    transaction,
    senderAuthenticator: signedTxn,
  });
  const response = await aptos.waitForTransaction({
    transactionHash: transactionResponse.hash,
  });
  return response;
}

main();
