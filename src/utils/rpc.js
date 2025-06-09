export async function fetchStatsFromRPC() {
  try {
    const response = await fetch('https://testnet-rpc.monad.xyz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: [],
      }),
    });

    const data = await response.json();
    const blockNumber = parseInt(data.result, 16);

    let totalTxs = 0;
    let totalContracts = 0;

    const blocksToCheck = 50;

    for (let i = blockNumber; i > blockNumber - blocksToCheck && i >= 0; i--) {
      const hexBlockNumber = '0x' + i.toString(16);
      const blockRes = await fetch('https://testnet-rpc.monad.xyz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getBlockByNumber',
          params: [hexBlockNumber, true],
        }),
      });

      const blockData = await blockRes.json();
      const txs = blockData.result?.transactions || [];

      totalTxs += txs.length;

      for (const tx of txs) {
        if (!tx.to) {
          totalContracts++;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return {
      totalTransactions: totalTxs,
      totalContracts: totalContracts,
    };
  } catch (error) {
    console.error('RPC Error:', error);
    return {
      totalTransactions: 'Error',
      totalContracts: 'Error',
    };
  }
}
