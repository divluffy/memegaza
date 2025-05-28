// src/context/WalletContext.tsx
import React, { useMemo, useEffect, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { connection } from "../services/solana";

// Provider component to wrap the app with Solana connection and wallet adapters
export const WalletContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Choose network: can be Mainnet, Devnet, etc.
  const network = WalletAdapterNetwork.Mainnet;

  // Initialize Phantom adapter
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  return (
    <ConnectionProvider endpoint={process.env.REACT_APP_SOLANA_RPC_URL!}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Custom hook to get the user's SOL balance and subscribe to updates
export const useWalletBalance = (): number => {
  const { connection } = useConnection();

  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (!publicKey) {
      setBalance(0);
      return;
    }

    let cancelled = false;
    // Helper to fetch and set balance
    const fetchBalance = async () => {
      try {
        const lamports = await connection.getBalance(publicKey);
        if (!cancelled) setBalance(lamports / 1e9);
      } catch (err) {
        console.error("Failed to fetch balance", err);
      }
    };

    // Initial fetch and then poll every 10s
    fetchBalance();
    const interval = setInterval(fetchBalance, 10_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [publicKey, connection]);

  return balance;
};
