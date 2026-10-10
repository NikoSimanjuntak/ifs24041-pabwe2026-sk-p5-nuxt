import tailwindcss from '@tailwindcss/vite'

const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'

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
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Delcom Cash Flow: catat pemasukan, pengeluaran, tabungan, dan pinjaman Anda dalam satu buku kas yang rapi.',
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        // Dimuat sebagai "print" agar tidak memblokir render, lalu diaktifkan setelah selesai diunduh.
        { rel: 'stylesheet', href: FONT_URL, media: 'print', onload: "this.media='all'" },
      ],
      // Cadangan jika JavaScript dimatikan.
      noscript: [{ innerHTML: `<link rel="stylesheet" href="${FONT_URL}">` }],
    },
  },
  vite: {
    plugins: [tailwindcss()],
    define: {
      // Variabel lingkungan global yang dipakai oleh src/helpers/apiHelper.ts
      DELCOM_BASEURL: JSON.stringify(process.env.VITE_DELCOM_BASEURL || 'https://open-api.delcom.org/api/v1'),
    },
  },
})