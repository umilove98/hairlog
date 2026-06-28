import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Pretendard',
          'Apple SD Gothic Neo',
          'Noto Sans KR',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
