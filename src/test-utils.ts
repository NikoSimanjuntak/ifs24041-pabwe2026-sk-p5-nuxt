import { render } from '@testing-library/vue'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { defineComponent, h, type Component } from 'vue'
import { createMemoryHistory, createRouter, RouterView, type RouteRecordRaw } from 'vue-router'
import type { CashFlow, CashFlowChartStats, CashFlowStats } from '~/features/cashflows/states/cashFlowsStore'
import type { User } from '~/features/users/api/userApi'

/** Membuat instance Pinia baru dan menjadikannya aktif (untuk test store maupun komponen). */
export const createMockPinia = (): Pinia => {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/** Komponen kosong untuk dipakai sebagai target rute pada test. */
export const Blank = defineComponent({ name: 'BlankStub', render: () => h('div', { 'data-testid': 'blank' }) })

/** Komponen root yang hanya me-render <RouterView /> (meniru App). */
export const RouterRoot = defineComponent({ name: 'RouterRootStub', render: () => h(RouterView) })

export const textStub = (text: string): Component =>
  defineComponent({ name: 'TextStub', render: () => h('p', text) })

export interface RenderWithProvidersOptions {
  route?: string
  routes?: RouteRecordRaw[]
  pinia?: Pinia
  props?: Record<string, unknown>
}

/** Me-render komponen dengan Pinia + Memory Router agar komponen yang terhubung store/rute dapat diuji. */
export async function renderWithProviders(component: Component, options: RenderWithProvidersOptions = {}) {
  const pinia = options.pinia ?? createMockPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: options.routes ?? [{ path: '/:pathMatch(.*)*', component: Blank }],
  })
  await router.push(options.route ?? '/')
  await router.isReady()
  const utils = render(component as Parameters<typeof render>[0], {
    props: options.props,
    global: { plugins: [pinia, router] },
  })
  return { ...utils, router, pinia }
}

export const createDeferred = <T>() => {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

// ---------- Fixture data ----------
export const mockUser: User = {
  id: 1,
  name: 'Delcom Testing',
  email: 'testing@delcom.org',
  email_verified_at: null,
  photo: null,
  created_at: '2024-10-05T02:53:38.000000Z',
  updated_at: '2024-10-05T02:53:38.000000Z',
}

export const mockCashFlows: CashFlow[] = [
  {
    id: 2,
    user_id: 1,
    type: 'inflow',
    source: 'cash',
    label: 'gaji',
    description: 'Gaji bulanan',
    nominal: 2500000,
    created_at: '2024-10-05T11:26:45.000000Z',
    updated_at: '2024-10-05T11:26:48.000000Z',
  },
  {
    id: 3,
    user_id: 1,
    type: 'outflow',
    source: 'savings',
    label: 'alat-elektronik',
    description: 'Membeli keyboard dan mouse',
    nominal: 400000,
    created_at: '2024-10-05T12:09:16.000000Z',
    updated_at: '2024-10-05T12:09:16.000000Z',
  },
]

export const mockStats: CashFlowStats = {
  cashflow: 2100000,
  total_inflow: 2500000,
  total_outflow: 400000,
  cash: 2500000,
  savings: -400000,
  loans: 0,
}

export const mockDailyStats: CashFlowChartStats = {
  stats_inflow: { '05-10-2024': 2500000, '06-10-2024': 0 },
  stats_outflow: { '05-10-2024': 400000, '06-10-2024': 0 },
  stats_cashflow: { '05-10-2024': 2100000, '06-10-2024': 0 },
}

export const mockMonthlyStats: CashFlowChartStats = {
  stats_inflow: { '09-2024': 0, '10-2024': 2500000, '11-2024': 0 },
  stats_outflow: { '09-2024': 0, '10-2024': 400000, '11-2024': 0 },
  stats_cashflow: { '09-2024': 0, '10-2024': 2100000, '11-2024': 0 },
}

export const emptyChartStats: CashFlowChartStats = { stats_inflow: {}, stats_outflow: {}, stats_cashflow: {} }
