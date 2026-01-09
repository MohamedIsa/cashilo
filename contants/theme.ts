export type Theme = {
  mode: 'light' | 'dark';
  background: string;
  primaryText: string;
  headline: string;
  primary: string;
  secondary: string;
  warning: string;
  error: string;
  card: string;
  border: string;
};

const commonColors: Omit<
  Theme,
  'mode' | 'background' | 'primaryText' | 'headline' | 'card' | 'border'
> = {
  primary: '#00B8D9',
  secondary: '#36B37E',
  warning: '#FFAB00',
  error: '#FF5630',
};

export const lightTheme: Theme = {
  mode: 'light',
  background: '#F9F9F9',
  primaryText: '#333333',
  headline: '#1E2A38',
  card: '#ECECEC',
  border: '#121212',
  ...commonColors,
};

export const darkTheme: Theme = {
  mode: 'dark',
  background: '#121212',
  primaryText: '#FFFFFF',
  headline: '#E0E0E0',
  card: '#1E1E1E',
  border: '#F9F9F9',
  ...commonColors,
};
