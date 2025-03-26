
import react from "@vitejs/plugin-react";
import svgr from 'vite-plugin-svgr'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const publicEnv = Object.entries(env).reduce((acc, [key, value]) => {
    if (key.startsWith('VITE_')) {
      return {
        ...acc,
        [key]: value,
      }
    }
    return acc
  }, {})
  return {
    plugins: [react(), svgr()],
    server: {
      port: +env.PORT,
    },
    preview: {
      port: +env.PORT,
    },
    define: {
      'process.env': publicEnv,
    },
  }
});
