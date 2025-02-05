import { AptosClient } from "aptos";

const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com/v1");

async function main() {
  const thlPriceUsd = await getThlPriceUsd();
  console.log(`1 THL = ${thlPriceUsd} USD`);
}

async function getThlPriceUsd(ledgerVersion?: string): Promise<number> {
  const [balancesRaw, weightsRaw] = await client.view(
    {
      function:
        "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool::pool_balances_and_weights",
      type_arguments: [
        "0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01::mod_coin::MOD",
        "0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL",
        "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null",
        "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null",
        "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool::Weight_20",
        "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool::Weight_80",
        "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null",
        "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null",
      ],
      arguments: [],
    },
    ledgerVersion,
  );
  const [modBalance, thlBalance] = balancesRaw as number[];
  const [modWeight, thlWeight] = weightsRaw as number[];

  // price1To0 = (balance0 / balance1) * (weight1 / weight0)
  const priceThlToMod = (modBalance / thlBalance) * (thlWeight / modWeight);

  // THL to MOD should be close to THL to USD, so we use that as a best-effort approximation
  return priceThlToMod;
}

main();
