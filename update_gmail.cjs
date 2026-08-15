const fs = require('fs');
let code = fs.readFileSync('src/components/FinanceHubTab.tsx', 'utf8');

if (!code.includes("getAccessToken")) {
  code = code.replace(
    "import { WorkShift, Expense, CreditCard, Invoice } from '../types';",
    "import { WorkShift, Expense, CreditCard, Invoice } from '../types';\nimport { getAccessToken } from '../firebase';\nimport { Mail } from 'lucide-react';"
  );
}

const emailFn = `
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const handleSettleUpEmail = async (expense: Expense) => {
    if (!expense.peerName) {
      alert("No peer associated with this expense.");
      return;
    }
    const emailTo = prompt("Enter peer's email address to send settlement link:", expense.peerName + "@example.com");
    if (!emailTo) return;
    
    setIsSendingEmail(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        alert("Please sign in to Google to send emails.");
        setIsSendingEmail(false);
        return;
      }
      
      const subject = \`Settle Up: \${expense.category} expense\`;
      const bodyText = \`Hi,\n\nJust a reminder to settle up for the recent \${expense.category} expense on \${expense.date}.\nThe total amount was \${expense.amount.toFixed(2)}, and your split is \${(expense.amount * (expense.splitRatio || 50) / 100).toFixed(2)}.\n\nThanks!\`;
      
      const email = [
        \`To: \${emailTo}\`,
        \`Subject: \${subject}\`,
        '',
        bodyText
      ].join('\\r\\n');
      
      // Base64Url encode
      const encodedEmail = btoa(unescape(encodeURIComponent(email)))
        .replace(/\\+/g, '-')
        .replace(/\\//g, '_')
        .replace(/=+$/, '');
        
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedEmail })
      });
      
      if (!res.ok) throw new Error("Failed to send email");
      
      alert(\`Settlement email sent to \${emailTo}!\`);
    } catch (e) {
      console.error(e);
      alert('Failed to send email.');
    } finally {
      setIsSendingEmail(false);
    }
  };
`;

code = code.replace("  const handleReceiptUpload", emailFn + "\n  const handleReceiptUpload");

const emailBtnHtml = `
                    {exp.isSplit && exp.peerName && (
                      <button 
                        onClick={() => handleSettleUpEmail(exp)}
                        disabled={isSendingEmail}
                        className="p-1.5 rounded-md hover:bg-white/5 text-gray-400 hover:text-[var(--accent)] transition-colors"
                        title="Send Settle Up Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    )}
`;

code = code.replace(
  `<button onClick={() => handleDeleteExpense(exp.id)}`,
  emailBtnHtml + `\n                    <button onClick={() => handleDeleteExpense(exp.id)}`
);

fs.writeFileSync('src/components/FinanceHubTab.tsx', code);
