import type { Config } from 'tailwindcss';
export default { content: ['./src/**/*.{ts,tsx}'], theme: { extend: { colors: { app: '#070B14', surface: '#0E1524', surface2: '#13203A', cyan: '#22D3EE', teal: '#14B8A6', muted: '#6B7794' }, fontFamily: { mono: ['JetBrains Mono','Cascadia Code','monospace'] } } }, plugins: [] } satisfies Config;
