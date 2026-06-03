import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const raw = JSON.parse(readFileSync(join(root, 'src/design/tokens.json'), 'utf8'))
// Skip the "comment" meta key
const tokens = Object.fromEntries(Object.entries(raw).filter(([k]) => k !== 'comment'))

const vars = Object.entries(tokens)
  .map(([key, value]) => `  --${key}: ${value};`)
  .join('\n')

const block = `/* BEGIN GENERATED TOKENS */\n:root {\n${vars}\n}\n/* END GENERATED TOKENS */`

const cssPath = join(root, 'src/app/globals.css')
const css = readFileSync(cssPath, 'utf8')

if (!css.includes('/* BEGIN GENERATED TOKENS */')) {
  console.error('✗ Marqueurs introuvables dans globals.css — vérifier que le fichier contient /* BEGIN GENERATED TOKENS */')
  process.exit(1)
}

const updated = css.replace(
  /\/\* BEGIN GENERATED TOKENS \*\/[\s\S]*?\/\* END GENERATED TOKENS \*\//,
  block
)

writeFileSync(cssPath, updated)
console.log(`✓ ${Object.keys(tokens).length} tokens générés → src/app/globals.css`)
