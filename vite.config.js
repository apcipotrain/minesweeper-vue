import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: './', // 或者写 '/minesweeper-vue/'，推荐用 './' 更灵活
  plugins: [vue()],
})
