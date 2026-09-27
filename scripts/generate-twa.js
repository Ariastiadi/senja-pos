/* Membuat proyek Android (Trusted Web Activity) dari twa-manifest.json
   tanpa prompt interaktif — dipakai GitHub Actions. */
const fs = require('fs');
const { TwaGenerator, TwaManifest, ConsoleLog } = require('@bubblewrap/core');

(async () => {
  const file = process.argv[2] || 'twa-manifest.json';
  const manifest = new TwaManifest(JSON.parse(fs.readFileSync(file, 'utf8')));
  const err = manifest.validate();
  if (err) { console.error('twa-manifest.json tidak valid:', err); process.exit(1); }
  await new TwaGenerator().createTwaProject('./android', manifest, new ConsoleLog('twa'));
  console.log('Proyek Android berhasil dibuat di ./android');
})().catch(e => { console.error(e); process.exit(1); });
