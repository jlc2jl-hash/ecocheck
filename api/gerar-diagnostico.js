export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Chave de API não configurada no ambiente da Vercel.' });
  }

  const dadosFormulario = req.body;

  const prompt = `Você é um engenheiro ambiental especialista em compliance para PMEs no Brasil.
Analise os dados desta empresa e gere um diagnóstico técnico resumido:

- Razão Social: ${dadosFormulario.razaoSocial || 'Não informada'}
- Atividade: ${dadosFormulario.atividade || 'Não informada'}
- Estado/Município: ${dadosFormulario.estado || ''} / ${dadosFormulario.municipio || ''}
- Porte: ${dadosFormulario.porte || ''}
- Resíduos: ${dadosFormulario.geraResiduos || 'Não informado'}
- Licença Ambiental: ${dadosFormulario.licenca || 'Não informada'}

Responda EXCLUSIVAMENTE em formato JSON com a seguinte estrutura exata:
{
  "nivelRisco": "BAIXO", 
  "pontosAtencao": 3,
  "resumoCards": [
    { "key": "licenciamento", "label": "Licenciamento", "value": "Texto orientativo", "tone": "blue" }
  ],
  "pendencias": [
    { "id": 1, "title": "Título da ação", "area": "Licenciamento", "priority": "ALTA", "detail": "Detalhamento da orientação" }
  ]
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro na resposta da OpenAI');
    }

    const resultadoIA = JSON.parse(data.choices[0].message.content);
    return res.status(200).json({ success: true, diagnostico: resultadoIA });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
