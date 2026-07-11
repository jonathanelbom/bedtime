// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['shadcn-nuxt'],
  app: {
    head: {
      htmlAttrs: { class: 'dark' },
      title: 'Bedtime',
      meta: [
        {
          name: 'description',
          content: 'Bedtime is an AI rhythm-section consultant for music producers. Describe your vibe, get structured production guidance for drums, bass, chords, and more.',
        },
        { property: 'og:url', content: 'https://bedtime-zeta.vercel.app' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Bedtime' },
        { property: 'og:description', content: 'Describe a vibe. Get production guidance.' },
        { property: 'og:image', content: 'https://bedtime-zeta.vercel.app/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: 'https://bedtime-zeta.vercel.app/og-image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap' },
      ],
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