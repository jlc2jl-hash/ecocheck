export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.OPENAI_API_KEY; // ou GEMINI_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'Chave de API da IA não configurada na Vercel.' });
  }

  const { cnpj, razaoSocial, atividade, geracaoResiduos, temLicenca } = req.body;

  const prompt = `Você é um engenheiro ambiental especialista em compliance e licenciamento.
  Analise a seguinte empresa e gere um diagnóstico técnico resumido:
  - Razão Social: ${razaoSocial}
  - Atividade: ${atividade}
  - Gera Resíduos/Efluentes: ${geracaoResiduos}
  - Licença Atual: ${temLicenca}

  Responda estritamente em formato JSON com as seguintes chaves:
  {
    "nivelRisco": "Baixo" | "Médio" | "Alto",
    "alertas": ["alerta 1", "alerta 2"],
    "pendencias": ["ação 1", "ação 2"]
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
