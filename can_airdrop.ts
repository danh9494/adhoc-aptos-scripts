import fs from "fs";
import { AptosClient } from "aptos";

const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com/v1");

const data = fs.readFileSync("./addresses.txt", "utf8");
const addresses = data.split("\n");

async function main() {
  for (let i = 0; i < addresses.length; i++) {
    const address = addresses[i];
    const can = await canAirdrop(address);
    if (!can) {
      console.log(address);
    }
    if (i % 50 === 0) {
      const percentage = (i / addresses.length) * 100;
      const progressBar =
        "=".repeat(i / 50) + " ".repeat(addresses.length / 50 - i / 50);
      console.log(`Progress: [${progressBar}] ${percentage.toFixed(2)}%`);
    }
  }
}

async function canAirdrop(account: string): Promise<boolean> {
  const res = await client.view({
    function: "0x1::aptos_account::can_receive_direct_coin_transfers",
    type_arguments: [],
    arguments: [account],
  });
  return res[0] as boolean;
}

main();
