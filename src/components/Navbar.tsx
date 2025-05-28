// src/components/Navbar.tsx
import React from "react";
import styled from "styled-components";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletBalance } from "../context/WalletContext";

// Styled navbar container
const Nav = styled.nav`
  width: 100%;
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.colors.surface};
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  top: 0;
  z-index: 100;
`;

// Title/logo text
const Title = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
`;

// Container for right-side info
const Info = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const Navbar: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const balance = useWalletBalance();

  // Shorten the public key for display: first 4 + last 4 chars
  const shortKey = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : "";

  return (
    <Nav>
      <Title>MemeGaza</Title>
      <Info>
        {/* Show key and balance when connected */}
        {connected && (
          <span>
            {shortKey} ({balance.toFixed(3)} SOL)
          </span>
        )}
        {/* Prebuilt connect/disconnect button */}
        <WalletMultiButton />
      </Info>
    </Nav>
  );
};
