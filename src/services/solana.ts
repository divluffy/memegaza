// src/services/solana.ts
import { Connection } from "@solana/web3.js";

// Initialize Solana RPC connection using environment variable
const rpcUrl = process.env.REACT_APP_SOLANA_RPC_URL!;
export const connection = new Connection(rpcUrl, "confirmed");
