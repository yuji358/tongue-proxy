export default async function handler(req, res) {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
if (req.method === 'OPTIONS') return res.status(200).end();
if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});
try {
const body = req.body;
const { image, mediaType } = body;
if (!image || !mediaType) return res.status(400).json({error: '画像データがありません'});
const response = await fetch('https://api.anthropic.com/v1/messages', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-api-key': process.env.ANTHROPIC_API_KEY,
'anthropic-version': '2023-06-01'
},
body: JSON.stringify({
model: 'claude-sonnet-4-6',
max_tokens: 2000,
messages: [{
role: 'user',
content: [
{
type: 'image',
source: { type: 'base64', media_type: mediaType, data: image }
},
{
type: 'text',
text: '中医学の舌診の専門家として、この舌の写真を詳しく分析してください。舌の色、苔、形、潤いなどを観察し、体質や健康状態について日本語で詳しく説明してください。'
}
]
}]
})
});
const data = await response.json();
res.status(response.status).json(data);
} catch(e) {
res.status(500).json({error: e.message});
}
}
