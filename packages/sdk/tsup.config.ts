import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'providers/index': 'src/providers/index.ts',
    'chat/index': 'src/chat/index.ts',
    'images/index': 'src/images/index.ts',
    'types/index': 'src/types/index.ts',
  },
  format: ['cjs', 'esm'],
  dts: false, // Temporarily disable due to type conflicts
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  minify: false, // Enable in production builds
  target: 'es2020',
  outDir: 'dist',
  esbuildOptions(options) {
    options.conditions = ['module'];
  },
});