// Arquivo: api/gerar-diagnostico.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Chave de API não configurada na Vercel.' });
  }

  const dadosFormulario = req.body;

  const prompt = `Você é um engenheiro ambiental especialista em compliance para PMEs no Brasil.
  Analise os dados desta empresa e gere um diagnóstico técnico resumido:
  
  - Razão Social: ${dadosFormulario.razaoSocial}
  - Atividade: ${dadosFormulario.atividade}
  - Estado/Município: ${dadosFormulario.estado} / ${dadosFormulario.municipio}
  - Porte: ${dadosFormulario.porte} (${dadosFormulario.area}, ${dadosFormulario.funcionarios} funcionários)
  - Uso de Água: ${dadosFormulario.usaAgua} (Origem: ${dadosFormulario.origemAgua}, Outorga: ${dadosFormulario.outorga})
  - Resíduos: ${dadosFormulario.geraResiduos} (Tipos: ${dadosFormulario.categoriasResiduos?.join(', ')})
  - Licença Ambiental: ${dadosFormulario.licenca}

  Responda EXCLUSIVAMENTE em formato JSON com a seguinte estrutura:
  {
    "nivelRisco": "BAIXO" | "MODERADO" | "ALTO",
    "pontosAtencao": 3,
    "resumoCards": [
      { "key": "licenciamento", "label": "Licenciamento", "value": "Texto descritivo", "tone": "blue" },
      { "key": "residuos", "label": "Resíduos", "value": "Texto descritivo", "tone": "orange" }
    ],
    "pendencias": [
      { "id": 1, "title": "Título da pendência", "area": "Licenciamento", "priority": "ALTA", "detail": "Explicação detalhada" }
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
    const resultadoIA = JSON.parse(data.choices[0].message.content);

    return res.status(200).json({ success: true, diagnostico: resultadoIA });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
