import React, { useEffect, useState } from "react";

const RPC_URL = "https://testnet-rpc.monad.xyz";

// Data di lancio testnet (stimata)
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

    if (!res.ok) throw new Error(`RPC error: ${res.status}`);
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
          contractCreationTxCount += block.transactions.filter(
            (tx) => tx.to === null
          ).length;
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
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #6a00f4, #9c63ff, #b27cff, #6a00f4)",
        minHeight: "100vh",
        padding: "40px 20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 30,
      }}
    >
      <img
        src="https://cdn.prod.website-files.com/667c57e6f9254a4b6d914440/667d7104644c621965495f6e_LogoMark.svg"
        alt="Monad Logo"
        style={{ width: 80, height: 80, marginBottom: 10, filter: "drop-shadow(0 0 4px #fff)" }}
      />
      <h1
        style={{
          fontWeight: "900",
          fontSize: "2.8rem",
          textShadow: "0 0 10px #d2afff",
          letterSpacing: "0.1em",
          margin: 0,
        }}
      >
        Monascope
      </h1>
      <h3 style={{ fontWeight: "400", marginTop: 0, color: "#e3d5ff" }}>
        Live Stats - Monad Testnet
      </h3>

      {error && (
        <div
          style={{
            color: "#ff4d4d",
            fontWeight: "700",
            fontSize: "1.2rem",
            marginTop: 10,
          }}
        >
          Error: {error}
        </div>
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
        {[
          { label: "Block Height", value: blockHeight ?? "..." },
          { label: "Txs (last 10 blocks)", value: recentTxCount ?? "..." },
          { label: "TPS (approx.)", value: tps ?? "..." },
          { label: "Contracts Created (last 10 blocks)", value: totalContracts ?? "..." },
          { label: "Dapps Created", value: "239" },
          { label: "Testnet Days", value: daysSinceTestnet },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: 20,
              padding: 20,
              boxShadow: "0 8px 32px 0 rgba(156, 99, 255, 0.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 12px 40px 0 rgba(156, 99, 255, 0.7)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow =
                "0 8px 32px 0 rgba(156, 99, 255, 0.3)";
            }}
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
            <span
              style={{
                fontSize: 28,
                fontWeight: "900",
                color: "#fff",
                letterSpacing: "0.05em",
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      <footer
        style={{
          marginTop: 50,
          fontSize: 14,
          color: "#bb99ffcc",
          userSelect: "none",
        }}
      >
        Powered by Monad
      </footer>
    </div>
  );
}

