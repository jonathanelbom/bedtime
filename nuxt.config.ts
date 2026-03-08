// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['shadcn-nuxt'],
  app: {
    head: {
      htmlAttrs: { class: 'dark' },
    },
  },
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    openaiApiKey: process.env.OPENAI_API_KEY,
    mockAi: process.env.MOCK_AI ?? '',
  },
  typescript: {
    strict: true,
    typeCheck: false,
  },
})