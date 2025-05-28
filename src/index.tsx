// src/index.tsx
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { WalletContextProvider } from "./context/WalletContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "styled-components";
import { darkTheme } from "./styles/theme";
import GlobalStyle from "./styles/GlobalStyle";
import "@solana/wallet-adapter-react-ui/styles.css";
import { createRoot } from "react-dom/client";

const queryClient = new QueryClient();
const container = document.getElementById("root") as HTMLElement;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <WalletContextProvider>
          <App />
        </WalletContextProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
