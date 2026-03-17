export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify(req.body)
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
```

**5.** **"Commit changes"** bas

---

**6.** Şimdi Vercel'de API key ekleyeceğiz:

- [vercel.com](https://vercel.com) → projeye tıkla → **"Settings"** → **"Environment Variables"**
- **Name:** `ANTHROPIC_API_KEY`
- **Value:** Anthropic API key'in *(console.anthropic.com → API Keys)*
- **"Save"** bas

---

**7.** Son olarak `index.html` dosyasında tek bir satırı değiştireceğiz.

Şu satırı bul:
```
const response = await fetch("https://api.anthropic.com/v1/messages", {
```

Şununla değiştir:
```
const response = await fetch("/api/quote", {
