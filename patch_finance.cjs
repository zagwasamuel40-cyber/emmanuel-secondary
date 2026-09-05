const fs = require('fs');
let code = fs.readFileSync('src/pages/Finance.tsx', 'utf-8');

if (!code.includes('useTransactions')) {
  code = code.replace(/import \{ useSessions, TERMS \} from "\.\.\/data\/sessionsData";/, 
    'import { useSessions, TERMS } from "../data/sessionsData";\nimport { useTransactions } from "../data/financeData";');
  code = code.replace(/const \[transactions, setTransactions\] = useState\(initialTransactions\);/, 
    'const [transactions, setTransactions] = useTransactions();');
  code = code.replace(/const initialTransactions = \[[\s\S]*?\];/, '');
  fs.writeFileSync('src/pages/Finance.tsx', code);
}
