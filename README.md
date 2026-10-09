# Delcom Cash Flow (Nuxt 4)

Praktikum PABWE2026 – Studi Kasus 2. Nuxt 4 (SPA, `ssr: false`), TypeScript, Bun, Pinia, Tailwind CSS v4, SweetAlert2, lucide-vue-next, Vitest.
Sumber data: https://open-api.delcom.org/docs/1.0/api-cash-flows

## Menjalankan
```bash
bun install
bun run dev                # http://localhost:APP_PORT
bun run build && bun run preview   # preview via start.mjs (membaca APP_PORT dari .env)
bun run test:coverage      # Vitest + coverage v8 (threshold 100%)
```

## Environment (`.env`)
```
VITE_DELCOM_BASEURL=https://open-api.delcom.org/api/v1
APP_PORT=3000
```

## Struktur
`src/helpers`, `src/hooks`, `src/features/{auth,users,cashflows,common}`, `src/routes.ts`, `src/router.options.ts`.
Rute proteksi dilakukan pada `CashFlowLayout.vue` (redirect ke `/auth/login` jika tidak ada token).

Catatan: endpoint ubah password mengikuti dokumentasi API: `PUT /users/password`.
