// src/services/solanaToken.ts

import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from "@solana/spl-token";
import { uploadFile, uploadJSON } from "./ipfs";
import type { WalletContextState } from "@solana/wallet-adapter-react";

interface LaunchParams {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  imageFile: File;
  description: string;
  website?: string;
  socials: { telegram?: string; twitter?: string; discord?: string };
  authorities: { freeze: boolean; mint: boolean; update: boolean };
  liquidity: { percent: number; solAmount: number; slippage: number };
  wallet: WalletContextState;
  connection: Connection;
}

export async function launchToken(params: LaunchParams): Promise<PublicKey> {
  const { wallet, connection } = params;
  const userPubkey = wallet.publicKey;
  if (!userPubkey) throw new Error("Wallet not connected");
  if (typeof wallet.signTransaction !== "function") {
    throw new Error("Wallet does not support signing transactions");
  }

  // 1️⃣ Upload logo to IPFS
  const imageUrl = await uploadFile(params.imageFile);

  // 2️⃣ Upload metadata JSON to IPFS
  const metadata = {
    name: params.name,
    symbol: params.symbol,
    description: params.description,
    image: imageUrl,
    external_url: params.website,
    properties: {
      creators: [{ address: userPubkey.toBase58(), share: 100 }],
      files: [{ uri: imageUrl, type: "image/png" }],
    },
  };
  const metadataUrl = await uploadJSON(metadata);

  // 3️⃣ Generate new mint keypair
  const mintKeypair = Keypair.generate();

  // 4️⃣ Get rent exemption for mint account
  const rentExemption = await getMinimumBalanceForRentExemptMint(connection);

  // 5️⃣ Derive user's associated token account (ATA) for the new mint
  const userATA = await getAssociatedTokenAddress(
    mintKeypair.publicKey,
    userPubkey
  );

  // 6️⃣ Build transaction
  const tx = new Transaction();

  tx.add(
    // Create mint account
    SystemProgram.createAccount({
      fromPubkey: userPubkey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports: rentExemption,
      programId: TOKEN_PROGRAM_ID,
    })
  );

  tx.add(
    // Initialize mint
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      params.decimals,
      userPubkey, // mint authority
      params.authorities.freeze ? userPubkey : null, // freeze authority or null
      TOKEN_PROGRAM_ID
    )
  );

  tx.add(
    // Create ATA for user
    createAssociatedTokenAccountInstruction(
      userPubkey,
      userATA,
      userPubkey,
      mintKeypair.publicKey
    )
  );

  tx.add(
    // Mint totalSupply to user's ATA
    createMintToInstruction(
      mintKeypair.publicKey,
      userATA,
      userPubkey,
      params.totalSupply * Math.pow(10, params.decimals)
    )
  );

  // TODO: Add Raydium liquidity instructions here using params.liquidity

  // 7️⃣ Prepare transaction for signing
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = userPubkey;

  // 8️⃣ Partially sign with the new mint keypair
  tx.partialSign(mintKeypair);

  // 9️⃣ Let Phantom sign the transaction
  const signedTx = await wallet.signTransaction(tx);

  // 🔟 Send and confirm
  const txId = await connection.sendRawTransaction(signedTx.serialize());
  await connection.confirmTransaction({
    signature: txId,
    blockhash,
    lastValidBlockHeight,
  });

  return mintKeypair.publicKey;
}
