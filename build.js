const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const JavaScriptObfuscator = require('javascript-obfuscator');

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

const imgSrc = path.join(__dirname, 'img');
const imgDest = path.join(distDir, 'img');
if (fs.existsSync(imgSrc)) {
  fs.cpSync(imgSrc, imgDest, { recursive: true });
}

['index.html', 'toroidal.html'].forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;

  const html = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(html, { decodeEntities: false });

  $('script').each((i, el) => {
    if ($(el).attr('src')) return;
    const rawCode = $(el).html();
    if (!rawCode || !rawCode.trim()) return;

    const obfuscated = JavaScriptObfuscator.obfuscate(rawCode, {
      compact: true,
      controlFlowFlattening: false,
      deadCodeInjection: false,
      debugProtection: false,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      renameGlobals: false,
      selfDefending: true,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 0.75
    }).getObfuscatedCode();

    $(el).html(obfuscated);
  });

  fs.writeFileSync(path.join(distDir, file), $.html(), 'utf8');
  console.log(`✓ Ofuscado y generado: dist/${file}`);
});
