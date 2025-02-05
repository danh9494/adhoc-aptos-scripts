import { AptosClient } from "aptos";

/**
 *  public fun one_lpt_thl_amount(): u64 {
        let one_lpt = math64::pow(10, (coin::decimals<WeightedPoolToken<MOD, THL, Null, Null, Weight_20, Weight_80, Null, Null>>() as u64));
        let lpt_supply = base_pool::pool_token_supply<WeightedPoolToken<MOD, THL, Null, Null, Weight_20, Weight_80, Null, Null>>();
        let (pool_balances, _) = weighted_pool::pool_balances_and_weights<MOD, THL, Null, Null, Weight_20, Weight_80, Null, Null>();
        weighted_math::compute_asset_amount_to_return(*vector::borrow(&pool_balances, 1), one_lpt, lpt_supply) // THL is at index 1
    }
 */

const THALASWAP_CONTRACT =
  "0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af";
const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com/v1");

async function main() {
  const lastLedger = await client.getLedgerInfo();
  const lastLedgerVersion = Number(lastLedger.ledger_version);
  const redeemded = await getRedeemdedTHL(lastLedgerVersion);
  console.log(
    `(${lastLedgerVersion})[${new Date(
      Number(lastLedger.ledger_timestamp) / 1000,
    ).toLocaleString()}] ${redeemded.toFixed(3)}`,
  );
}

async function getRedeemdedTHL(ledgerVersion: number) {
  const [supplyString] = await client.view(
    {
      function: `${THALASWAP_CONTRACT}::base_pool::pool_token_supply`,
      type_arguments: [
        `${THALASWAP_CONTRACT}::weighted_pool::WeightedPoolToken<0x6f986d146e4a90b828d8c12c14b6f4e003fdff11a8eecceceb63744363eaac01::mod_coin::MOD, 0x7fd500c11216f0fe3095d0c4b8aa4d64a4e2e04f83758462f2b127255643615::thl_coin::THL, 0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null, 0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null, 0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool::Weight_20, 0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::weighted_pool::Weight_80, 0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null, 0x48271d39d0b05bd6efca2278f22277d6fcc375504f9839fd73f74ace240861af::base_pool::Null>`,
      ],
      arguments: [],
    },
    ledgerVersion.toString(),
  );
  const supply = Number(supplyString);

  const [poolBalances] = await client.view(
    {
      function: `${THALASWAP_CONTRACT}::weighted_pool::pool_balances_and_weights`,
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
    ledgerVersion.toString(),
  );
  const thlBalance = Number(poolBalances[1]);

  // LPT to redeem / LPT supply = THL to redeem / THL balance
  // => THL to redeem = LPT to redeem * THL balance / LPT supply
  return thlBalance / supply;
}

main();
