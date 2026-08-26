const fs = require('fs');

let file = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Used PINs table (Line ~924)
file = file.replace(
  '<td className="p-3 font-mono text-amber-300 font-bold">{p.pinCode}</td>',
  '<td className="p-3 font-mono text-amber-300 font-bold cursor-pointer" onClick={() => toggleRevealPin(p.id)} title="Click to reveal/hide">\n                            {revealedPins[p.id] ? p.pinCode : "••••-••••-••••"}\n                          </td>'
);

// 2. Activation Control Center table (Line ~1053)
file = file.replace(
  '<td className="p-3 font-mono text-amber-300 font-bold">{p.pinCode}</td>',
  '<td className="p-3 font-mono text-amber-300 font-bold cursor-pointer" onClick={() => toggleRevealPin(p.id)} title="Click to reveal/hide">\n                          {revealedPins[p.id] ? p.pinCode : "••••-••••-••••"}\n                        </td>'
);

// 3. Single Activation Target (Line ~1300)
file = file.replace(
  '<p>PIN Code: <strong className="text-amber-300">{singleActivationTarget.pinCode}</strong></p>',
  '<p className="cursor-pointer select-none" onClick={() => toggleRevealPin(singleActivationTarget.id)} title="Click to reveal/hide">\n                          PIN Code: <strong className="text-amber-300">\n                            {revealedPins[singleActivationTarget.id] ? singleActivationTarget.pinCode : "••••-••••-••••"}\n                          </strong>\n                        </p>'
);

fs.writeFileSync('src/pages/Dashboard.tsx', file);
