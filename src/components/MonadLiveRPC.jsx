import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Lottie from "react-lottie-player";
import monanimalData from "../assets/monanimal.json"; // Lottie JSON file

const RPC_URL = "https://testnet-rpc.monad.xyz";
const TESTNET_START_TIMESTAMP = new Date("2025-02-19T00:00:00Z");

export default function MonadLiveRPC() {
  const [blockHeight, setBlockHeight] = useState(null);
  const [recentTxCount, setRecentTxCount] = useState(null);
  const [tps, setTps] = useState(null);
  const [totalContracts, setTotalContracts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const daysSinceTestnet = Math.floor(
    (new Date().getTime() - TESTNET_START_TIMESTAMP.getTime()) / (1000 * 60 * 60 * 24)
  );

  async function rpc(method, params = []) {
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    };

    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(RPC error: ${res.status});
    const json = await res.json();
    if (json.error) throw new Error(json.error.message || "RPC Error");
    return json.result;
  }

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);

      const blockNumberHex = await rpc("eth_blockNumber");
      const blockNumber = parseInt(blockNumberHex, 16);
      setBlockHeight(blockNumber);

      const recentBlocks = [];
      for (let i = 0; i < 10; i++) {
        const block = await rpc("eth_getBlockByNumber", [
          "0x" + (blockNumber - i).toString(16),
          true,
        ]);
        recentBlocks.push(block);
      }

      let totalTx = 0;
      let contractCreationTxCount = 0;
      recentBlocks.forEach((block) => {
        if (block && block.transactions) {
          totalTx += block.transactions.length;
          contractCreationTxCount += block.transactions.filter((tx) => tx.to === null).length;
        }
      });
      setRecentTxCount(totalTx);
      setTotalContracts(contractCreationTxCount);

      const timestamps = recentBlocks
        .map((b) => (b ? parseInt(b.timestamp, 16) : 0))
        .filter((t) => t > 0);
      if (timestamps.length >= 2) {
        const timeSpan = timestamps[0] - timestamps[timestamps.length - 1];
        const calcTps = timeSpan > 0 ? totalTx / timeSpan : 0;
        setTps(calcTps.toFixed(2));
      } else {
        setTps("N/A");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      style={{
        background: "linear-gradient(135deg, #4b0082, #7c3aed, #a855f7, #9333ea)",
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 30,
        overflow: "hidden",
      }}
    >
      <Lottie
        loop
        animationData={monanimalData}
        play
        style={{ width: 100, height: 100 }}
      />

      <motion.h1
        style={{
          fontWeight: "900",
          fontSize: "2.8rem",
          textShadow: "0 0 10px #d2afff",
          letterSpacing: "0.1em",
          margin: 0,
        }}
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        Monascope
      </motion.h1>

      <h3 style={{ fontWeight: "400", marginTop: 0, color: "#e3d5ff" }}>
        Live Stats - Monad Testnet
      </h3>

      {error && (
        <motion.div
          style={{ color: "#ff4d4d", fontWeight: "700", fontSize: "1.2rem", marginTop: 10 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          Error: {error}
        </motion.div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 25,
          width: "100%",
          maxWidth: 900,
        }}
      >
        {[{
          label: "Block Height",
          value: blockHeight ?? "..."
        }, {
          label: "Txs (last 10 blocks)",
          value: recentTxCount ?? "..."
        }, {
          label: "TPS (approx.)",
          value: tps ?? "..."
        }, {
          label: "Contracts Created",
          value: totalContracts ?? "..."
        }, {
          label: "Dapps Created",
          value: "239"
        }, {
          label: "Testnet Days",
          value: daysSinceTestnet
        }].map(({ label, value }) => (
          <motion.div
            key={label}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: 20,
              padding: 20,
              boxShadow: "0 8px 32px 0 rgba(156, 99, 255, 0.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "default",
            }}
            whileHover={{ scale: 1.05, boxShadow: "0 12px 40px rgba(156, 99, 255, 0.7)" }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: "#cdb4ff",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              {label}
            </span>
            <motion.span
              style={{
                fontSize: 28,
                fontWeight: "900",
                color: "#fff",
                letterSpacing: "0.05em",
              }}
              key={value}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {value}
            </motion.span>
          </motion.div>
        ))}
      </div>

      <footer style={{ marginTop: 50, fontSize: 14, color: "#bb99ffcc", userSelect: "none" }}>
        Powered by Monad & Monanimals
      </footer>
    </motion.div>
  );
}
