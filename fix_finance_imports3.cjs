const fs = require('fs');
let code = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

code = code.replace(
  "import { DollarSign, Clock, X, AlertTriangle, Wallet, CreditCard as CardIcon, Receipt, Upload, Trash2, Plus, Download, Loader2, Bot } from 'lucide-react';", 
  "import { ArrowRightLeft, Share2, Users, DollarSign, Clock, X, AlertTriangle, Wallet, CreditCard as CardIcon, Receipt, Upload, Trash2, Plus, Download, Loader2, Bot } from 'lucide-react';"
);

fs.writeFileSync('src/components/FinanceHubTab.tsx', code);
