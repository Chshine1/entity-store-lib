import {defineConfig, type UserConfig} from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';

const config: UserConfig = {
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        react: path.resolve(__dirname, 'src/react/index.ts')
      },
      name: 'EntityStoreLib',
      formats: ['es', 'umd'],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
        },
        interop: 'auto',
      },
    },
    sourcemap: true,
    minify: false
  },
  plugins: [dts({
    entryRoot: 'src',
    outDir: 'dist',
    insertTypesEntry: true,
    rollupTypes: true
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom')
    }
  }
};

export default defineConfig(config);