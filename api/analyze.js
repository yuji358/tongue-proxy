export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { image, mediaType } = req.body;
    if (!image || !mediaType) return res.status(400).json({ error: '画像データが必要です' });
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'APIキーが設定されていません' });
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
          { type: 'text', text: '中医学の舌診の観点からこの舌の画像を分析してください。以下を日本語で簡潔に：\n1.舌の色\n2.舌の形\n3.舌苔\n4.潤い\n5.推測体質\n6.養生アドバイス1〜2文\n※医療診断ではありません。' }
        ]}]
      })
    });
    const data = await response.json();
    return res.status(200).json({ result: data.content?.[0]?.text || '分析できませんでした' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
