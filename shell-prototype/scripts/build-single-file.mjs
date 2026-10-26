// Builds the whole prototype into ONE html file (Exxat_One_Prototype.html) that opens from disk.
// Usage: node scripts/build-single-file.mjs
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
execFileSync('npx', ['vite', 'build', '--config', 'vite.single.config.ts'], { cwd: root, stdio: 'inherit' })

const dist = join(root, 'dist-single')
let html = readFileSync(join(dist, 'index.html'), 'utf8')
const read = (href) => readFileSync(join(dist, href.replace(/^\.\//, '')), 'utf8')

// Only local files are folded in; the Google Fonts and FontAwesome links stay as links.
html = html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (m, href) => (/^https?:/.test(href) ? m : `<style>\n${read(href)}\n</style>`))
html = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g, (_m, src) => {
  const js = read(src).replace(/<\/script/gi, '<\\/script')
  return `<script type="module">\n${js}\n</script>`
})
if (/src="\.?\/?assets\//.test(html) || /href="\.?\/?assets\//.test(html)) throw new Error('an asset was left un-inlined')

const out = join(root, 'Exxat_One_Prototype.html')
writeFileSync(out, html)
rmSync(dist, { recursive: true, force: true })
console.log('wrote', out, (html.length / 1e6).toFixed(2) + ' MB')
