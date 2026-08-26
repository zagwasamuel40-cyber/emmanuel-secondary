const fs = require('fs');

let file = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

file = file.replace(
  'const [lastGeneratedPin, setLastGeneratedPin] = useState<PinRecord | null>(null);',
  'const [lastGeneratedPin, setLastGeneratedPin] = useState<PinRecord | null>(null);\n  const [isLastPinRevealed, setIsLastPinRevealed] = useState(false);'
);

file = file.replace(
  'setLastGeneratedPin(newPin);',
  'setLastGeneratedPin(newPin);\n    setIsLastPinRevealed(false);'
);

file = file.replace(
  '<span>{lastGeneratedPin.pinCode}</span>',
  `<span>{isLastPinRevealed ? lastGeneratedPin.pinCode : "••••-••••-••••"}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="h-8 text-xs bg-slate-800 text-white border-slate-700 gap-1" onClick={() => setIsLastPinRevealed(!isLastPinRevealed)}>
                          {isLastPinRevealed ? <EyeOff size={14} /> : <Eye size={14} />} 
                        </Button>`
);

file = file.replace(
  '<Button size="sm" variant="outline" className="h-8 text-xs bg-slate-800 text-white border-slate-700 gap-1" onClick={() => handleCopyPin(lastGeneratedPin.pinCode, lastGeneratedPin.id)}>\n                        <Copy size={14} /> Copy Code\n                      </Button>\n                    </div>',
  '<Button size="sm" variant="outline" className="h-8 text-xs bg-slate-800 text-white border-slate-700 gap-1" onClick={() => handleCopyPin(lastGeneratedPin.pinCode, lastGeneratedPin.id)}>\n                          <Copy size={14} /> Copy Code\n                        </Button>\n                      </div>\n                    </div>'
);

fs.writeFileSync('src/pages/Dashboard.tsx', file);
