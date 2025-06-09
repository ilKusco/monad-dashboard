import React, { useEffect, useState } from "react";

const GOLD_RUSH_API_KEY = import.meta.env.VITE_GOLDRUSH_API_KEY;
const GOLD_RUSH_BASE_URL = "https://api.covalenthq.com/v1";

function MonadStats() {
  const [stats, setStats] = useState({
    blockHeight: null,
    totalTxs: null,
    tps: null,
    totalAccounts: null,
    newAccounts24h: null,
    totalContracts: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const chainId = "monad-testnet"; // Verifica questo valore con GoldRush/documentazione

      const url = `${GOLD_RUSH_BASE_URL}/${chainId}/stats/?key=${GOLD_RUSH_API_KEY}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      // Adatta questa parte in base alla risposta reale
      const statsData = data.data;

      setStats({
        blockHeight: statsData.block_height || "N/A",
        totalTxs: statsData.tx_count || "N/A",
        tps: statsData.tps || "N/A",
        totalAccounts: statsData.wallet_count || "N/A",
        newAccounts24h: statsData.new_wallets_24h || "N/A",
        totalContracts: statsData.contracts_count || "N/A",
      });
    } catch (err) {
      setError(err.message);
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div style={{ padding: 20, color: "#9C63FF" }}>Loading Monad Stats...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>Error: {error}</div>;

  return (
    <div
      style={{
        color: "#9C63FF",
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
        padding: 20,
        backgroundColor: "#1a0a40",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: 40 }}>Monascope - Live Monad Testnet Stats</h1>
      <ul style={{ listStyleType: "none", fontSize: 18, maxWidth: 500, margin: "auto", padding: 0 }}>
        <li><strong>Block Height:</strong> {stats.blockHeight}</li>
        <li><strong>Total Transactions:</strong> {stats.totalTxs}</li>
        <li><strong>Transactions Per Second (TPS):</strong> {stats.tps}</li>
        <li><strong>Total Wallets:</strong> {stats.totalAccounts}</li>
        <li><strong>New Wallets (Last 24h):</strong> {stats.newAccounts24h}</li>
        <li><strong>Total Contracts Deployed:</strong> {stats.totalContracts}</li>
      </ul>
    </div>
  );
}

export default MonadStats;
