import React, { useEffect, useState } from "react";

const API_URL = "https://testnet-rpc.monad.xyz/";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalWallets: 0,
    totalTxs: 0,
    txs24h: 0,
    newWallets24h: 0,
    contractsDeployed: 0,
    tps: 0,
  });

  const fetchData = async () => {
    try {
      const blockBefore = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_blockNumber",
          params: [],
        }),
      }).then(res => res.json());

      const currentBlock = parseInt(blockBefore.result, 16);
      const timestampNow = Math.floor(Date.now() / 1000);

      // Simulazione di dati (sostituiscili con veri endpoint o Flipside in futuro)
      setStats({
        totalWallets: 15243,
        totalTxs: 124009,
        txs24h: 3451,
        newWallets24h: 523,
        contractsDeployed: 712,
        tps: (3451 / 86400).toFixed(2),
      });
    } catch (err) {
      console.error("Errore nel recupero dei dati:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <h1>🧿 Monascope Dashboard</h1>
      <h3>Live stats from Monad Testnet</h3>
      <div className="stat-card">Total Wallets: {stats.totalWallets}</div>
      <div className="stat-card">Total Transactions: {stats.totalTxs}</div>
      <div className="stat-card">Transactions (24h): {stats.txs24h}</div>
      <div className="stat-card">New Wallets (24h): {stats.newWallets24h}</div>
      <div className="stat-card">Contracts Deployed: {stats.contractsDeployed}</div>
      <div className="stat-card">Transactions Per Second (TPS): {stats.tps}</div>
    </div>
  );
};

export default Dashboard;
