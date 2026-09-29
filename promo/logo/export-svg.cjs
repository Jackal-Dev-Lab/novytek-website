// Extrait les marques de planche.html et les écrit en SVG autonomes (fond clair et fond sombre).
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/planche.html', 'utf8');
const block = src.slice(src.indexOf('const MARKS = {'), src.indexOf('const INFO'));
const MARKS = eval('(' + block.replace('const MARKS = ', '').trim().replace(/;$/, '') + ')');
fs.mkdirSync(__dirname + '/svg', { recursive: true });
for (const k of Object.keys(MARKS)) {
  for (const [variant, ac, bg] of [['fond-sombre', '#7cc6fb', '#08132b'], ['fond-clair', k === 'clic' ? '#08132b' : '#7cc6fb', '#ffffff']]) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">${MARKS[k]('#1b8ce3', ac, '#0b4f96', bg).trim()}</svg>\n`;
    fs.writeFileSync(`${__dirname}/svg/novytek-logo-${k}-${variant}.svg`, svg);
  }
}
console.log(fs.readdirSync(__dirname + '/svg').join('\n'));
