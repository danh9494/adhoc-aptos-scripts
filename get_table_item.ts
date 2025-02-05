import { AptosClient } from "aptos";

const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com/v1");
const coins = ["0x1::aptos_coin::AptosCoin", "0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL"]
main();

async function main() {
    for (const coin of coins) {
        const item = await client.getTableItem("0xdc375a754557bcd28ab8d380872225ae9929eaa9f2d4f05b71b95b4282a198e7", {
            key_type: "0x1::string::String",
            value_type: "vector<u8>",
            key: coin
        });
        console.log(`Coin ${coin} has pyth feed:`, item);
    }
}