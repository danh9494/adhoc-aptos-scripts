import { AptosClient } from "aptos";

const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");

async function main() {
  let apr = await calcSthAptApr();
  console.log(`sthAPT APR: ${(apr * 100).toFixed(2)}%`);
}

async function calcSthAptApr() {
  const info = await client.getLedgerInfo();
  const rate = await getSthAptThAptExchangeRateSynced(info.ledger_version);
  const pastLedgerVersion = Number(info.ledger_version) - 200000;
  const pastRate = await getSthAptThAptExchangeRateSynced(
    String(pastLedgerVersion),
  );
  const pastInfo = await client.getBlockByVersion(pastLedgerVersion);
  console.log(
    `1 sthAPT = ${rate} thAPT at ${new Date(
      Number(info.ledger_timestamp) / 1000,
    ).toLocaleString("en-US")}`,
  );
  console.log(
    `1 sthAPT = ${pastRate} thAPT at ${new Date(
      Number(pastInfo.block_timestamp) / 1000,
    ).toLocaleString("en-US")}`,
  );
  return (
    ((rate - pastRate) /
      pastRate /
      (Number(info.ledger_timestamp) - Number(pastInfo.block_timestamp))) *
    1000000 * // microseconds to seconds
    365 *
    24 *
    60 *
    60
  );
}

async function getSthAptThAptExchangeRateSynced(ledgerVersion?: string) {
  const result = await client.view(
    {
      function:
        "0ebb91f1b0d422aa0820de017e9b54a796167dc500ad4324f389e55856c63aaa::staking::thAPT_sthAPT_exchange_rate_synced",
      type_arguments: [],
      arguments: [],
    },
    ledgerVersion,
  );
  return Number(result[0]) / Number(result[1]);
}

main();
