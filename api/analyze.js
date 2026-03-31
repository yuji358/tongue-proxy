export default async function handler(req, res) {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
if (req.method === 'OPTIONS') return res.status(200).end();
if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
try {
// bodyを手動で読み込む
let rawBody = '';
await new Promise((resolve, reject) => {
req.on('data', chunk => rawBody += chunk);
req.on('end', resolve);
req.on('error', reject);
});
const { image, mediaType } = JSON.parse(rawBody);
if (!image || !mediaType) return res.status(400).json({ error: '画像データがありません' });

const response = await fetch('https://api.anthropic.com/v1/messages', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-api-key': process.env.ANTHROPIC_API_KEY,
'anthropic-version': '2023-06-01'
},
body: JSON.stringify({
model: 'claude-sonnet-4-6',
max_tokens: 600,
messages: [{ role: 'user', content: [
{ type: 'image', source: { type: 'base64', media_type: mediaType, data: image }},
{ type: 'text', text: '中医学の舌診の観点からこの舌の画像を分析してください。以下を日本語で簡潔に答えてください：\n1.舌の色（淡白/淡紅/紅/紫）\n2.舌の形（胖大/痩薄/歯痕など）\n3.舌苔（白/黄/薄い/厚い）\n4.潤い（潤/乾燥）\n5.推測体質（気虚/血虚/陰虚/陽虚/気滞/血瘀/痰湿/湿熱）\n6.養生アドバイス1〜2文\n※医療診断ではありません。'}
]}]
})
});
const data = await response.json();
const text = data.content?.[0]?.text;
if (!text) return res.status(200).json({ result: 'APIエラー: ' + JSON.stringify(data.error || data) });
return res.status(200).json({ result: text });
} catch (error) {
return res.status(500).json({ error: error.message });
}
}
