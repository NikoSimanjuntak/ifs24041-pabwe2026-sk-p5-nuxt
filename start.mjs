// Preview launcher: membaca APP_PORT dari .env lalu menjalankan `nuxt preview`.
// Pemakaian: bun run build && bun run preview
import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

export function readEnv(file = '.env') {
  if (!existsSync(file)) return {}
  return Object.fromEntries(
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=')
        const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, '')
        return [line.slice(0, index).trim(), value]
      }),
  )
}

const port = readEnv().APP_PORT || process.env.APP_PORT || '3000'
console.log(`Menjalankan preview pada http://localhost:${port}`)

const child = spawn('bunx', ['nuxt', 'preview', '--port', port], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
child.on('exit', (code) => process.exit(code ?? 0))
