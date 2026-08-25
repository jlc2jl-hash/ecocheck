import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Leaf, ArrowRight, ShieldCheck, FileText, Recycle, Clock,
  Sparkles, AlertTriangle, Loader2, Check, QrCode, Copy, CheckCircle,
  FileAlert, CheckSquare, RefreshCw
} from "lucide-react";

/* ============================== SUPABASE ============================== */
const SUPABASE_URL = "https://gfnlzibbnpoqtfdootya.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_K1BaZXSLbgLEsBX9LzPsAQ_GrDiM2fA";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const C = {
  forest: "#173C30",
  green: "#1F7A52",
  greenBright: "#3FAE7C",
  greenSoft: "#E7F3EB",
  paper: "#FAFAF7",
  paperDim: "#F2F3EF",
  ink: "#17201C",
  gray600: "#5C6A62",
  gray400: "#8D9990",
  line: "#DEE4DD",
  blue: "#3D6FB4",
  blueSoft: "#E9F0FA",
  orange: "#E1752F",
  orangeSoft: "#FBEADF",
  red: "#D32F2F",
  redSoft: "#FDE8E8",
  white: "#FFFFFF",
};

function Btn({ children, onClick, variant = "primary", size = "md", icon: Icon, disabled, style }) {
  const sizes = { sm: "8px 14px", md: "11px 20px", lg: "15px 28px" };
  const base = {
    fontFamily: "inherit", fontWeight: 600, fontSize: size === "lg" ? 16 : 14, borderRadius: 10,
    padding: sizes[size], display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    cursor: disabled ? "not-allowed" : "pointer", border: "none", opacity: disabled ? 0.7 : 1, ...style
  };
  const variants = {
    primary: { background: C.forest, color: C.white },
    accent: { background: C.orange, color: C.white },
    secondary: { background: C.white, color: C.forest, border: `1.5px solid ${C.line}` },
    ghost: { background: "transparent", color: C.forest },
  };
  return (
    <button disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant] }}>
      {children}
      {Icon && <Icon size={18} />}
    </button>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, padding: 24, ...style }}>
      {children}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("landing");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingPix, setLoadingPix] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    cnpj: "41.223.870/0001-05",
    razaoSocial: "Barbosa Construções Ltda",
    atividade: "Construção civil / Reformas",
    geracaoResiduos: "Sim",
    temLicenca: "Não tenho certeza",
  });

  const [diagnostico, setDiagnostico] = useState(null);

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // MOTOR DE DIAGNÓSTICO INTELIGENTE
  const processarDiagnostico = () => {
    let nivelRisco = "Médio";
    let alertas = [];
    let pendencias = [];

    if (form.geracaoResiduos === "Sim") {
      alertas.push("Obrigatório cadastro do MTR (Manifesto de Transporte de Resíduos).");
      pendencias.push("Elaborar PGRS (Plano de Gerenciamento de Resíduos Sólidos)");
    }

    if (form.temLicenca === "Não" || form.temLicenca === "Não tenho certeza") {
      nivelRisco = "Alto";
      alertas.push("Empresa operando sem comprovação de Licença Ambiental (Sujeito a Notificação/Multa).");
      pendencias.push("Verificar enquadramento no órgão ambiental estadual/municipal");
      pendencias.push("Solicitar Licença Prévia/Operação ou Certidão de Dispensa");
    } else {
      pendencias.push("Monitorar prazos de condicionantes da Licença Operacional");
    }

    pendencias.push("Manter licenças do Corpo de Bombeiros e Alvará atualizados");

    return { nivelRisco, alertas, pendencias };
  };

  const handleSubmitOnboarding = async () => {
    setLoading(true);
    const resultadoDiag = processarDiagnostico();
    setDiagnostico(resultadoDiag);

    try {
      await supabase.from("se_empresas").insert([
        {
          cnpj: form.cnpj,
          razao_social: form.razaoSocial,
          atividade: form.atividade,
          geracao_residuos: form.geracaoResiduos,
          tem_licenca: form.temLicenca,
        },
      ]);
    } catch (err) {
      console.error("Erro ao gravar dados no Supabase:", err);
    } finally {
      setLoading(false);
      setView("resultado");
    }
  };

  const gerarPix = async (valor, plano) => {
    setLoadingPix(true);
    try {
      const res = await fetch("/api/criar-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cpfCnpj: form.cnpj.replace(/\D/g, "") || "41223870000105",
          name: form.razaoSocial || "Empresa EcoCheck",
          value: valor,
          description: `Plano ${plano} - EcoCheck`
        })
      });
      const data = await res.json();
      if (data.success) {
        setPixData(data);
      } else {
        alert("Aviso do PIX: " + (data.error || "Certifique-se de configurar a variável ASAAS_API_KEY na Vercel."));
      }
    } catch (e) {
      alert("Falha ao comunicar com o servidor de pagamento.");
    } finally {
      setLoadingPix(false);
    }
  };

  const copiarPix = () => {
    if (pixData?.payload) {
      navigator.clipboard.writeText(pixData.payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", color: C.ink, background: C.paper, minHeight: "100vh" }}>
      {/* HEADER */}
      <div style={{ position: "sticky", top: 0, background: `${C.paper}EE`, backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.line}`, padding: "16px 24px", zIndex: 100 }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setView("landing")}>
            <Leaf size={24} color={C.greenBright} />
            <span style={{ fontWeight: 800, fontSize: 20, color: C.forest }}>EcoCheck</span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Btn variant="ghost" size="sm" onClick={() => {
              const el = document.getElementById("planos-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
              else setView("landing");
            }}>Planos</Btn>
            <Btn variant="primary" size="sm" onClick={() => { setStep(1); setView("onboarding"); }}>Diagnóstico Grátis</Btn>
          </div>
        </div>
      </div>

      {/* LANDING PAGE */}
      {view === "landing" && (
        <div>
          <div style={{ maxWidth: 900, margin: "60px auto 40px", textAlign: "center", padding: "0 20px" }}>
            <span style={{ background: C.greenSoft, color: C.green, fontSize: 13, fontWeight: 700, padding: "6px 14px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <Leaf size={14} /> Gestão Ambiental Descomplicada para PMEs
            </span>
            <h1 style={{ fontSize: 42, fontWeight: 800, color: C.forest, margin: "16px 0", lineHeight: 1.2 }}>
              Sua empresa está em dia com as obrigações ambientais?
            </h1>
            <p style={{ fontSize: 18, color: C.gray600, marginBottom: 32 }}>
              Descubra em menos de 2 minutos quais licenças, condicionantes e relatórios de resíduos a sua operação precisa para evitar multas.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Btn size="lg" icon={ArrowRight} onClick={() => { setStep(1); setView("onboarding"); }}>Fazer diagnóstico gratuito</Btn>
            </div>
          </div>

          <div style={{ maxWidth: 1140, margin: "60px auto", padding: "0 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
              <Card>
                <ShieldCheck size={32} color={C.green} style={{ marginBottom: 12 }} />
                <h3 style={{ color: C.forest, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Licenciamento Ambiental</h3>
                <p style={{ color: C.gray600, fontSize: 14 }}>Descubra se sua empresa necessita de LP, LI, LO ou Dispensa de Licença.</p>
              </Card>
              <Card>
                <Recycle size={32} color={C.green} style={{ marginBottom: 12 }} />
                <h3 style={{ color: C.forest, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Controle de Resíduos</h3>
                <p style={{ color: C.gray600, fontSize: 14 }}>Rastreabilidade de MTR e Plano de Gerenciamento de Resíduos (PGRS).</p>
              </Card>
              <Card>
                <Clock size={32} color={C.green} style={{ marginBottom: 12 }} />
                <h3 style={{ color: C.forest, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Alertas de Condicionantes</h3>
                <p style={{ color: C.gray600, fontSize: 14 }}>Evite multas acompanhando prazos de renovação de licenças em tempo real.</p>
              </Card>
            </div>
          </div>

          {/* PLANOS */}
          <div id="planos-section" style={{ background: C.paperDim, padding: "80px 20px", borderTop: `1px solid ${C.line}` }}>
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              <h2 style={{ textAlign: "center", color: C.forest, fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Assine e Mantenha Sua Empresa Regular</h2>
              <p style={{ textAlign: "center", color: C.gray600, fontSize: 16, marginBottom: 40 }}>Escolha o plano ideal e pague via PIX com liberação imediata</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
                <Card>
                  <h3 style={{ color: C.forest, fontSize: 20, fontWeight: 700 }}>Pequena Empresa</h3>
                  <div style={{ fontSize: 32, fontWeight: 800, color: C.green, margin: "12px 0" }}>R$ 39,90 <span style={{ fontSize: 14, color: C.gray600 }}>/mês</span></div>
                  <Btn style={{ width: "100%" }} variant="accent" onClick={() => gerarPix(39.90, "Pequena Empresa")} disabled={loadingPix}>
                    {loadingPix ? <Loader2 className="ec-spin" size={18} /> : "Assinar via PIX"}
                  </Btn>
                </Card>

                <Card style={{ border: `2px solid ${C.green}` }}>
                  <h3 style={{ color: C.forest, fontSize: 20, fontWeight: 700 }}>Profissional</h3>
                  <div style={{ fontSize: 32, fontWeight: 800, color: C.green, margin: "12px 0" }}>R$ 89,90 <span style={{ fontSize: 14, color: C.gray600 }}>/mês</span></div>
                  <Btn style={{ width: "100%" }} variant="primary" onClick={() => gerarPix(89.90, "Profissional")} disabled={loadingPix}>
                    {loadingPix ? <Loader2 className="ec-spin" size={18} /> : "Assinar via PIX"}
                  </Btn>
                </Card>
              </div>

              {pixData && (
                <div style={{ marginTop: 40 }}>
                  <Card style={{ maxWidth: 420, margin: "0 auto", textAlign: "center", border: `2px solid ${C.greenBright}` }}>
                    <QrCode size={36} color={C.green} style={{ marginBottom: 8 }} />
                    <h3 style={{ color: C.forest, fontSize: 20, fontWeight: 700 }}>QR Code PIX Gerado!</h3>
                    {pixData.encodedImage && (
                      <img src={`data:image/png;base64,${pixData.encodedImage}`} alt="QR Code PIX" style={{ width: 200, height: 200, margin: "16px auto", borderRadius: 8 }} />
                    )}
                    <Btn variant="secondary" onClick={copiarPix} icon={copied ? CheckCircle : Copy}>
                      {copied ? "Chave Copiada!" : "Copiar PIX Copia e Cola"}
                    </Btn>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FORMULÁRIO DE DIAGNÓSTICO */}
      {view === "onboarding" && (
        <div style={{ padding: "40px 20px" }}>
          <div style={{ maxWidth: 500, margin: "0 auto" }}>
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase", marginBottom: 8 }}>Etapa {step} de 3</div>
              {step === 1 && (
                <div>
                  <h2 style={{ color: C.forest, fontSize: 20, marginBottom: 16 }}>Dados do Empreendimento</h2>
                  <div style={{ display: "grid", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600 }}>CNPJ</label>
                      <input style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}`, boxSizing: "border-box" }} value={form.cnpj} onChange={(e) => handleChange("cnpj", e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600 }}>Razão Social / Nome</label>
                      <input style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}`, boxSizing: "border-box" }} value={form.razaoSocial} onChange={(e) => handleChange("razaoSocial", e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 style={{ color: C.forest, fontSize: 20, marginBottom: 16 }}>Atividade e Resíduos</h2>
                  <div style={{ display: "grid", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600 }}>Ramo de Atuação</label>
                      <input style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}`, boxSizing: "border-box" }} value={form.atividade} onChange={(e) => handleChange("atividade", e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600 }}>Gera resíduos sólidos ou efluentes?</label>
                      <select style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}`, boxSizing: "border-box" }} value={form.geracaoResiduos} onChange={(e) => handleChange("geracaoResiduos", e.target.value)}>
                        <option value="Sim">Sim, produz resíduos na operação</option>
                        <option value="Não">Não gera resíduos significativos</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 style={{ color: C.forest, fontSize: 20, marginBottom: 16 }}>Situação Licenciamento</h2>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600 }}>Possui Licença Ambiental ativa?</label>
                    <select style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}`, boxSizing: "border-box", marginTop: 4 }} value={form.temLicenca} onChange={(e) => handleChange("temLicenca", e.target.value)}>
                      <option value="Sim">Sim, possui Licença de Operação (LO)</option>
                      <option value="Não">Não possui nenhuma licença</option>
                      <option value="Não tenho certeza">Não tenho certeza</option>
                    </select>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                {step > 1 ? <Btn variant="secondary" onClick={() => setStep(step - 1)}>Voltar</Btn> : <Btn variant="ghost" onClick={() => setView("landing")}>Cancelar</Btn>}
                {step < 3 ? <Btn onClick={() => setStep(step + 1)}>Avançar</Btn> : <Btn variant="accent" onClick={handleSubmitOnboarding} disabled={loading}>{loading ? "Gerando Diagnóstico..." : "Gerar Diagnóstico"}</Btn>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TELA DE RESULTADO DO DIAGNÓSTICO GERADO */}
      {view === "resultado" && diagnostico && (
        <div style={{ padding: "40px 20px" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            <Card>
              <div style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase" }}>Diagnóstico Técnico Gerado</span>
                  <h1 style={{ color: C.forest, fontSize: 24, fontWeight: 800, margin: "4px 0" }}>{form.razaoSocial}</h1>
                  <span style={{ fontSize: 13, color: C.gray600 }}>CNPJ: {form.cnpj}</span>
                </div>
              </div>

              {/* STATUS DE RISCO */}
              <div style={{ background: diagnostico.nivelRisco === "Alto" ? C.redSoft : C.orangeSoft, padding: 16, borderRadius: 12, marginBottom: 24, border: `1px solid ${diagnostico.nivelRisco === "Alto" ? C.red : C.orange}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <AlertTriangle color={diagnostico.nivelRisco === "Alto" ? C.red : C.orange} size={24} />
                  <div>
                    <strong style={{ color: diagnostico.nivelRisco === "Alto" ? C.red : C.orange, fontSize: 16 }}>Nível de Risco Ambiental: {diagnostico.nivelRisco}</strong>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: C.ink }}>Identificamos pontos de atenção urgentes para adequação regulatória da empresa.</p>
                  </div>
                </div>
              </div>

              {/* ALERTAS */}
              {diagnostico.alertas.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ color: C.forest, fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Alertas Regulatórios:</h3>
                  <div style={{ display: "grid", gap: 8 }}>
                    {diagnostico.alertas.map((alerta, i) => (
                      <div key={i} style={{ background: C.paperDim, padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: C.ink, display: "flex", alignItems: "center", gap: 8 }}>
                        <FileAlert size={16} color={C.orange} /> {alerta}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PLANO DE AÇÃO PENDÊNCIAS */}
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ color: C.forest, fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Ações Obrigatórias para Regularização:</h3>
                <div style={{ display: "grid", gap: 8 }}>
                  {diagnostico.pendencias.map((pendencia, i) => (
                    <div key={i} style={{ background: C.white, border: `1px solid ${C.line}`, padding: "10px 14px", borderRadius: 8, fontSize: 13.5, color: C.ink, display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckSquare size={16} color={C.green} /> {pendencia}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: C.greenSoft, padding: 20, borderRadius: 12, textAlign: "center" }}>
                <h4 style={{ color: C.forest, margin: "0 0 8px", fontSize: 16 }}>Deseja regularizar essas pendências com acompanhamento?</h4>
                <p style={{ color: C.gray600, fontSize: 13.5, margin: "0 0 16px" }}>Assine um dos nossos planos e tenha suporte especialista completo.</p>
                <Btn icon={ArrowRight} onClick={() => {
                  setView("landing");
                  setTimeout(() => {
                    document.getElementById("planos-section")?.scrollIntoView({ behavior: "smooth" });
                  }, 200);
                }}>Ver Planos de Regularização</Btn>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
