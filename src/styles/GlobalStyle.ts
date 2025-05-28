// src/styles/GlobalStyle.ts
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    padding: 0;
    background: ${({ theme }) => theme.colors.background};
    color:      ${({ theme }) => theme.colors.text};
    font-family: 'Arial', sans-serif;
  }
  #root {
    padding-top: 64px; /* reserve space for fixed navbar */
  }
`;

export default GlobalStyle;
