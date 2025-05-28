import React from "react";
import styled from "styled-components";

// Wrapper for dashboard content
const Wrapper = styled.div`
  padding: 1rem 0;
`;

export const Dashboard: React.FC = () => (
  <Wrapper>
    <h2>Overview</h2>
    <p>Here you’ll see your recently created tokens and latest transactions.</p>
    {/* TODO: Replace with real dashboard widgets */}
  </Wrapper>
);
