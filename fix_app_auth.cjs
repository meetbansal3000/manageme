const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import { initAuth, googleSignIn } from './firebase';")) {
  code = code.replace(
    "import { Header } from './components/Header';",
    "import { initAuth, googleSignIn, logout, getAccessToken } from './firebase';\nimport { Header } from './components/Header';"
  );
}

const authState = `
  const [needsAuth, setNeedsAuth] = useState(true);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => { setNeedsAuth(false); setAuthToken(token); },
      () => { setNeedsAuth(true); setAuthToken(null); }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setNeedsAuth(false);
        setAuthToken(res.accessToken);
      }
    } catch (e) { console.error("Login failed", e); }
  };
`;

code = code.replace(
  "  const { data: userData, updateData, loading } = useFirestoreData();",
  "  const { data: userData, updateData, loading } = useFirestoreData();\n" + authState
);

fs.writeFileSync('src/App.tsx', code);
