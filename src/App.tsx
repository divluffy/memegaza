import React from "react";
import styled from "styled-components";
import { Navbar } from "./components/Navbar";
import { Tabs } from "./components/Tabs";
import { Dashboard } from "./components/Dashboard";
import CreateToken from "./components/CreateToken";
import { MyTokens } from "./components/MyTokens";
import { Settings } from "./components/Settings";

// Main container below the fixed navbar
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const App: React.FC = () => {
  // Define tabs with labels and corresponding components
  const tabs = [
    { label: "Dashboard", content: <Dashboard /> },
    { label: "Create Token", content: <CreateToken /> },
    { label: "My Tokens", content: <MyTokens /> },
    { label: "Settings", content: <Settings /> },
  ];

  return (
    <>
      <Navbar />
      <Container>
        <Tabs tabs={tabs} />
      </Container>
    </>
  );
};

export default App;
