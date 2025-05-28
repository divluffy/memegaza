// Extend styled-components DefaultTheme interface
import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      background: string;
      surface: string;
      primary: string;
      secondary: string;
      text: string;
      textSecondary: string;
      error: string;
    };
  }
}
