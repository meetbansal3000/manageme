const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = "import { motion, AnimatePresence } from 'motion/react';\n" + app;
fs.writeFileSync('src/App.tsx', app);
