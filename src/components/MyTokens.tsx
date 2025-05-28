import React from "react";
import styled from "styled-components";

// Wrapper for my-tokens list
const Wrapper = styled.div`
  padding: 1rem 0;
`;

export const MyTokens: React.FC = () => (
  <Wrapper>
    <h2>My Tokens</h2>
    <p>
      Manage your existing tokens, add/remove liquidity, or perform rug pull.
    </p>
    {/* TODO: Table of tokens with actions */}
  </Wrapper>
);
