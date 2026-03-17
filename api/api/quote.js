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

**Commit changes** bas.

---

**ADIM 3 — `index.html` içinde tek satır değiştir**

GitHub'da `index.html` dosyasını aç → sağ üstte kalem ikonuna bas (Edit) → `Ctrl+F` ile şunu bul:
```
https://api.anthropic.com/v1/messages
```

Bulunca o satırı şununla değiştir:
```
/api/quote
