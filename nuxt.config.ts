import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false, // SPA mode
  srcDir: 'src/',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt'],
  pages: true, // rute dikelola lewat src/router.options.ts -> src/routes.ts
  css: ['~/index.css'],
  devServer: {
    port: Number(process.env.APP_PORT) || 3000,
  },
  typescript: { strict: true },
  app: {
    head: {
      title: 'Delcom Cash Flow',
      htmlAttrs: { lang: 'id' },
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
    define: {
      // Variabel lingkungan global yang dipakai oleh src/helpers/apiHelper.ts
      DELCOM_BASEURL: JSON.stringify(process.env.VITE_DELCOM_BASEURL),
    },
  },
})
