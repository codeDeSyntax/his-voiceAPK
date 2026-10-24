
export interface AppTheme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    secondary: string;
    text: string;
    tint?: string;
    hlight: string;
    blueText: string;
  };
}

export interface ThemeProps { theme: AppTheme }
