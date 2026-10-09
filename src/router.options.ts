import type { RouterConfig } from '@nuxt/schema'
import { routes } from './routes'

// Nuxt memakai rute dari src/routes.ts alih-alih routing berbasis folder pages/.
export default {
  routes: () => routes,
} satisfies RouterConfig
