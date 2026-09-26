const fs = require('fs');
const zlib = require('zlib');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

const LIMIT = 15360;

(async () => {
  let html = fs.readFileSync('src/index.src.html', 'utf8');
  const engine = fs.readFileSync('src/tween.js', 'utf8');

  const js = async (code) => (await minify(code, { compress: { passes: 3 }, mangle: true })).code;
  const css = (code) => new CleanCSS({ level: 2 }).minify(code).styles;

  html = html.replace('<script>/* @include tween.js */</script>', '<script>' + (await js(engine)) + '</script>');

  const scripts = [];
  html = html.replace(/<script>([\s\S]*?)<\/script>/g, (m, code) => { scripts.push(code); return `<script>@@${scripts.length - 1}@@</script>`; });
  for (let i = 0; i < scripts.length; i++) html = html.replace(`@@${i}@@`, await js(scripts[i]));
  html = html.replace(/<style>([\s\S]*?)<\/style>/g, (m, code) => '<style>' + css(code) + '</style>');
  html = html.replace(/\n\s+/g, '\n').replace(/\n+/g, '\n');

  fs.writeFileSync('index.html', html);
  const gz = zlib.gzipSync(html, { level: 9 }).length;
  console.log(`index.html: ${html.length} bytes, ${gz} bytes gzipped, limit ${LIMIT}, ${LIMIT - gz} spare`);
  if (gz > LIMIT) process.exit(1);
})();
