export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.ASAAS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      success: false, 
      error: 'Chave ASAAS_API_KEY não encontrada nas variáveis de ambiente da Vercel.' 
    });
  }

  try {
    const { cpfCnpj, name, value, description } = req.body;

    // Sanitiza o documento deixando apenas números
    const docLimpo = (cpfCnpj || '41223870000105').replace(/\D/g, '');

    // 1. Criar ou Buscar Cliente no Asaas
    const customerRes = await fetch('https://www.asaas.com/api/v3/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey
      },
      body: JSON.stringify({
        name: name || 'Empresa EcoCheck',
        cpfCnpj: docLimpo,
        email: 'contato@ecocheck.com.br'
      })
    });

    const customerData = await customerRes.json();

    let customerId = customerData.id;

    // Se o cliente já existir no Asaas, pega o ID dele na busca
    if (!customerId && customerData.errors) {
      const searchRes = await fetch(`https://www.asaas.com/api/v3/customers?cpfCnpj=${docLimpo}`, {
        headers: { 'access_token': apiKey }
      });
      const searchData = await searchRes.json();
      if (searchData.data && searchData.data.length > 0) {
        customerId = searchData.data[0].id;
      }
    }

    if (!customerId) {
      return res.status(400).json({ 
        success: false, 
        error: customerData.errors?.[0]?.description || 'Erro ao cadastrar cliente no Asaas.' 
      });
    }

    // 2. Criar a Cobrança PIX
    const paymentRes = await fetch('https://www.asaas.com/api/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': apiKey
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'PIX',
        value: value || 39.90,
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        description: description || 'Assinatura EcoCheck'
      })
    });

    const paymentData = await paymentRes.json();

    if (!paymentData.id) {
      return res.status(400).json({ 
        success: false, 
        error: paymentData.errors?.[0]?.description || 'Erro ao criar cobrança.' 
      });
    }

    // 3. Obter o QR Code e Payload PIX
    const qrRes = await fetch(`https://www.asaas.com/api/v3/payments/${paymentData.id}/pixQrCode`, {
      headers: { 'access_token': apiKey }
    });

    const qrData = await qrRes.json();

    return res.status(200).json({
      success: true,
      encodedImage: qrData.encodedImage,
      payload: qrData.payload,
      expirationDate: qrData.expirationDate
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
