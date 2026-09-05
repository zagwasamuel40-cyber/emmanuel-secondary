const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');

if (!css.includes('.print-footer')) {
  css = css.replace(/#print-area \{/, `
  .print-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 10px;
    color: #666;
    padding-bottom: 10px;
    border-top: 1px solid #ccc;
    padding-top: 5px;
  }
  #print-area {`);
  fs.writeFileSync('src/index.css', css);
}
