main();

async function main() {
    const res = await fetch("https://app.thala.fi/api/liquidity-pools").then(r => r.json());
    const pools = res["data"];
    const tvl = pools.reduce((tvl, pool) => tvl + pool["tvl"], 0);
    console.log("TVL:", tvl);
}