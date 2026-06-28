import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 강한 순검정 대신 따뜻한 다크 로즈로 (텍스트/보더 톤이 부드러워짐)
        black: '#5a3540',
        brand: {
          light: '#ffedf1',
          DEFAULT: '#ffb6c1',
          mid: '#ffb6c9',
          deep: '#ff6f91',
          text: '#7a2f44',
        },
      },
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
