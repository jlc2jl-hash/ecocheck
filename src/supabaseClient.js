import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Isso aparece no console do navegador (F12) se as variáveis não estiverem
  // configuradas na Vercel (Settings → Environment Variables).
  console.warn(
    "[EcoCheck] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configuradas. " +
    "Login, cadastro e dados salvos não vão funcionar até isso ser corrigido."
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

/**
 * Salva (ou substitui) o diagnóstico do usuário logado.
 * Guarda os dados da empresa + resultado da IA em `diagnosticos`,
 * e cada item de pendência em `pendencias`, ligados por diagnostico_id.
 */
export async function salvarDiagnostico(userId, respostas, diagnostico) {
  // Remove diagnóstico anterior do usuário (mantemos só o mais recente por enquanto).
  await supabase.from("diagnosticos").delete().eq("user_id", userId);

  const { data: novo, error: insertError } = await supabase
    .from("diagnosticos")
    .insert({
      user_id: userId,
      razao_social: respostas.razaoSocial,
      nome_fantasia: respostas.nomeFantasia,
      cnpj: respostas.cnpj,
      estado: respostas.estado,
      municipio: respostas.municipio,
      atividade: respostas.atividade,
      porte: respostas.porte,
      area: respostas.area,
      funcionarios: respostas.funcionarios,
      respostas,
      nivel_risco: diagnostico.nivelRisco,
      pontos_atencao: diagnostico.pontosAtencao,
      resumo_cards: diagnostico.resumoCards,
    })
    .select()
    .single();

  if (insertError || !novo) return { error: insertError };

  if (Array.isArray(diagnostico.pendencias) && diagnostico.pendencias.length) {
    const { error: pendError } = await supabase.from("pendencias").insert(
      diagnostico.pendencias.map((p) => ({
        diagnostico_id: novo.id,
        user_id: userId,
        title: p.title,
        area: p.area,
        priority: p.priority,
        detail: p.detail,
      }))
    );
    if (pendError) return { error: pendError };
  }

  return { data: novo };
}

/**
 * Carrega o diagnóstico mais recente do usuário logado, já no formato
 * que as telas (Resultado, Dashboard, Pendências) esperam.
 * Retorna null se o usuário ainda não fez nenhum diagnóstico.
 */
export async function carregarDiagnostico(userId) {
  const { data: diag } = await supabase
    .from("diagnosticos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!diag) return null;

  const { data: pendencias } = await supabase
    .from("pendencias")
    .select("*")
    .eq("diagnostico_id", diag.id)
    .order("created_at", { ascending: true });

  return {
    nivelRisco: diag.nivel_risco,
    pontosAtencao: diag.pontos_atencao,
    resumoCards: diag.resumo_cards || [],
    pendencias: (pendencias || []).map((p) => ({
      id: p.id, title: p.title, area: p.area, priority: p.priority, detail: p.detail, status: p.status,
    })),
    empresa: {
      razaoSocial: diag.razao_social, nomeFantasia: diag.nome_fantasia, cnpj: diag.cnpj,
      estado: diag.estado, municipio: diag.municipio, atividade: diag.atividade,
      porte: diag.porte, area: diag.area, funcionarios: diag.funcionarios,
    },
  };
}
