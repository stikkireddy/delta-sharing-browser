import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: [
                {
                    dir: "docs",
                    entryFileNames: `[name].[hash].js`,
                    chunkFileNames: `[name].[hash].js`,
                    assetFileNames: `[name].[hash].[ext]`,
                },
            ],
        },
    }
})
