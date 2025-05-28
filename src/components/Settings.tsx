import React from "react";
import styled from "styled-components";

// Wrapper for settings panel
const Wrapper = styled.div`
  padding: 1rem 0;
`;

export const Settings: React.FC = () => (
  <Wrapper>
    <h2>Settings</h2>
    <p>Configure your preferences, fee wallet, network choice, and logout.</p>
    {/* TODO: Settings form */}
  </Wrapper>
);
