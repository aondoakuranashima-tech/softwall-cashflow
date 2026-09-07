const fs = require('fs');
const path = require('path');
const dist = path.join(__dirname, 'dist');
fs.mkdirSync(dist, { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js']) {
  fs.copyFileSync(path.join(__dirname, file), path.join(dist, file));
}
console.log('Softwall Cashflow web app build complete');
