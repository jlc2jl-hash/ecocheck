import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Leaf, ArrowRight, ShieldCheck, FileText, Recycle, Droplets, Clock,
  Sparkles, AlertTriangle, Loader2, Check, QrCode, Copy, CheckCircle,
  BarChart3, Building2, CheckSquare
} from "lucide-react";

/* ============================== CONEXÃO SUPABASE ============================== */
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
  white: "#FFFFFF",
};

function Pill({ tone = "gray", children, icon: Icon }) {
  const tones = {
    blue: { bg: C.blueSoft, fg: C.blue },
    orange: { bg: C.orangeSoft, fg: C.orange },
    green: { bg: C.greenSoft, fg: C.green },
    gray: { bg: C.paperDim, fg: C.gray600 },
  };
  const t = tones[tone] || tones.gray;
  return (
    <span style={{ background: t.bg, color: t.fg, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5 }}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", icon: Icon, disabled, style }) {
  const sizes = { sm: "8px 14px", md: "11px 20px", lg: "15px 28px" };
  const base = {
    fontFamily: "inherit", fontWeight: 600, fontSize: size === "lg" ? 16 : 14, borderRadius: 10,
    padding: sizes[size], display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    cursor: disabled ? "not-allowed" : "pointer", border: "none", opacity: disabled ? 0.7 : 1, width: style?.width || "auto"
  };
  const variants = {
    primary: { background: C.forest, color: C.white },
    accent: { background: C.orange, color: C.white },
    secondary: { background: C.white, color: C.forest, border: `1.5px solid ${C.line}` },
    ghost: { background: "transparent", color: C.forest },
  };
  return (
    <button disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>
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
    razaoSocial: "Construtora Barbosa Ltda.",
    nomeFantasia: "Barbosa Construções",
    estado: "RJ",
    municipio: "Rio de Janeiro",
    atividade: "Construção civil",
    geracaoResiduos: "Sim",
    fonteAgua: "Poço artesiano",
    temLicenca: "Não tenho certeza",
  });

  const handleChange = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmitOnboarding = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("se_empresas").insert([
        {
          cnpj: form.cnpj,
          razao_social: form.razaoSocial,
          nome_fantasia: form.nomeFantasia,
          estado: form.estado,
          municipio: form.municipio,
          atividade: form.atividade,
          geracao_residuos: form.geracaoResiduos,
          fonte_agua: form.fonteAgua,
          tem_licenca: form.temLicenca,
        },
      ]);
      if (error) console.error("Erro Supabase:", error);
    } catch (err) {
      console.error(err);
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
          cpfCnpj: form.cnpj || "41.223.870/0001-05",
          name: form.razaoSocial || "Empresa EcoCheck",
          value: valor,
          description: `Plano ${plano} - EcoCheck`
        })
      });
      const data = await res.json();
      if (data.success) {
        setPixData(data);
      } else {
        alert("Erro ao gerar PIX: " + (data.error || "Verifique a chave de API na Vercel."));
      }
    } catch (e) {
      alert("Falha de conexão ao gerar o PIX.");
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
      {/* NAVBAR */}
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
            <Btn variant="primary" size="sm" onClick={() => setView("onboarding")}>Diagnóstico Grátis</Btn>
          </div>
        </div>
      </div>

      {/* TELA: LANDING PAGE COMPLETA */}
      {view === "landing" && (
        <div>
          {/* HERO */}
          <div style={{ maxWidth: 900, margin: "60px auto 40px", textAlign: "center", padding: "0 20px" }}>
            <Pill tone="green" icon={Leaf}>Gestão Ambiental Descomplicada para PMEs</Pill>
            <h1 style={{ fontSize: 42, fontWeight: 800, color: C.forest, margin: "20px 0 16px", lineHeight: 1.2 }}>
              Sua empresa está em dia com as obrigações ambientais?
            </h1>
            <p style={{ fontSize: 18, color: C.gray600, marginBottom: 32, maxWidth: 680, margin: "0 auto 32px" }}>
              Descubra em menos de 2 minutos quais licenças, condicionantes e relatórios de resíduos a sua operação precisa para evitar multas.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Btn size="lg" icon={ArrowRight} onClick={() => setView("onboarding")}>Fazer diagnóstico gratuito</Btn>
              <Btn variant="secondary" size="lg" onClick={() => {
                document.getElementById("recursos")?.scrollIntoView({ behavior: "smooth" });
              }}>Conhecer recursos</Btn>
            </div>
          </div>

          {/* RECURSOS / CARDS */}
          <div id="recursos" style={{ maxWidth: 1140, margin: "80px auto", padding: "0 20px" }}>
            <h2 style={{ textAlign: "center", color: C.forest, fontSize: 28, fontWeight: 800, marginBottom: 40 }}>Tudo o que você precisa para manter a conformidade</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
              <Card>
                <ShieldCheck size={32} color={C.green} style={{ marginBottom: 12 }} />
                <h3 style={{ color: C.forest, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Licenciamento Simplificado</h3>
                <p style={{ color: C.gray600, fontSize: 14, lineHeight: 1.5 }}>Identifique se sua empresa precisa de LP, LI, LO ou se enquadra na Dispensa de Licenciamento Ambiental.</p>
              </Card>
              <Card>
                <Recycle size={32} color={C.green} style={{ marginBottom: 12 }} />
                <h3 style={{ color: C.forest, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>MTR e Manifesto de Resíduos</h3>
                <p style={{ color: C.gray600, fontSize: 14, lineHeight: 1.5 }}>Controle a destinação correta de resíduos com relatórios e rastreabilidade prontos para auditorias.</p>
              </Card>
              <Card>
                <Clock size={32} color={C.green} style={{ marginBottom: 12 }} />
                <h3 style={{ color: C.forest, fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Alertas de Vencimento</h3>
                <p style={{ color: C.gray600, fontSize: 14, lineHeight: 1.5 }}>Receba avisos automáticos por e-mail sobre condicionantes e renovações de licenças antes do prazo.</p>
              </Card>
            </div>
          </div>

          {/* PLANOS DE ASSINATURA */}
          <div id="planos-section" style={{ background: C.paperDim, padding: "80px 20px", borderTop: `1px solid ${C.line}` }}>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
              <h2 style={{ textAlign: "center", color: C.forest, fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Planos simples e transparentes</h2>
              <p style={{ textAlign: "center", color: C.gray600, fontSize: 16, marginBottom: 48 }}>Escolha a cobertura ideal e assine via PIX sem burocracia</p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
                {/* PLANO PEQUENA EMPRESA */}
                <Card>
                  <Pill tone="blue">Essencial</Pill>
                  <h3 style={{ color: C.forest, fontSize: 22, fontWeight: 700, marginTop: 12 }}>Pequena Empresa</h3>
                  <div style={{ fontSize: 36, fontWeight: 800, color: C.green, margin: "16px 0" }}>R$ 39,90 <span style={{ fontSize: 14, color: C.gray600, fontWeight: 400 }}>/mês</span></div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "20px 0", fontSize: 14, color: C.gray600, display: "grid", gap: 10 }}>
                    <li style={{ display: "flex", gap: 8, alignItems: "center" }}><Check size={16} color={C.green} /> Diagnóstico ambiental completo</li>
                    <li style={{ display: "flex", gap: 8, alignItems: "center" }}><Check size={16} color={C.green} /> Controle de 1 CNPJ</li>
                    <li style={{ display: "flex", gap: 8, alignItems: "center" }}><Check size={16} color={C.green} /> Alertas de vencimento por e-mail</li>
                  </ul>
                  <Btn style={{ width: "100%" }} variant="accent" onClick={() => gerarPix(39.90, "Pequena Empresa")} disabled={loadingPix}>
                    {loadingPix ? <Loader2 className="ec-spin" size={18} /> : "Assinar via PIX"}
                  </Btn>
                </Card>

                {/* PLANO PROFISSIONAL */}
                <Card style={{ border: `2px solid ${C.green}`, position: "relative" }}>
                  <Pill tone="green">Mais Popular</Pill>
                  <h3 style={{ color: C.forest, fontSize: 22, fontWeight: 700, marginTop: 12 }}>Profissional</h3>
                  <div style={{ fontSize: 36, fontWeight: 800, color: C.green, margin: "16px 0" }}>R$ 89,90 <span style={{ fontSize: 14, color: C.gray600, fontWeight: 400 }}>/mês</span></div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "20px 0", fontSize: 14, color: C.gray600, display: "grid", gap: 10 }}>
                    <li style={{ display: "flex", gap: 8, alignItems: "center" }}><Check size={16} color={C.green} /> Tudo do plano Pequena Empresa</li>
                    <li style={{ display: "flex", gap: 8, alignItems: "center" }}><Check size={16} color={C.green} /> Gestão de até 5 CNPJs / Filiais</li>
                    <li style={{ display: "flex", gap: 8, alignItems: "center" }}><Check size={16} color={C.green} /> Módulos de MTR & Resíduos</li>
                    <li style={{ display: "flex", gap: 8, alignItems: "center" }}><Check size={16} color={C.green} /> Suporte técnico dedicado</li>
                  </ul>
                  <Btn style={{ width: "100%" }} variant="primary" onClick={() => gerarPix(89.90, "Profissional")} disabled={loadingPix}>
                    {loadingPix ? <Loader2 className="ec-spin" size={18} /> : "Assinar via PIX"}
                  </Btn>
                </Card>
              </div>

              {/* MODAL / EXIBIÇÃO DO QR CODE PIX */}
              {pixData && (
                <div style={{ marginTop: 40 }}>
                  <Card style={{ maxWidth: 450, margin: "0 auto", textAlign: "center", border: `2px solid ${C.greenBright}` }}>
                    <QrCode size={36} color={C.green} style={{ marginBottom: 8 }} />
                    <h3 style={{ color: C.forest, fontSize: 20, fontWeight: 700 }}>Pagamento via PIX Gerado!</h3>
                    <p style={{ fontSize: 13, color: C.gray600, margin: "8px 0 16px" }}>Abra o aplicativo do seu banco e escaneie o código abaixo:</p>

                    {pixData.encodedImage && (
                      <img
                        src={`data:image/png;base64,${pixData.encodedImage}`}
                        alt="QR Code PIX Asaas"
                        style={{ width: 220, height: 220, margin: "0 auto", borderRadius: 12, border: `1px solid ${C.line}` }}
                      />
                    )}

                    <div style={{ marginTop: 20 }}>
                      <Btn variant="secondary" onClick={copiarPix} icon={copied ? CheckCircle : Copy}>
                        {copied ? "Chave Copiada!" : "Copiar PIX Copia e Cola"}
                      </Btn>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TELA: ONBOARDING / DIAGNÓSTICO */}
      {view === "onboarding" && (
        <div style={{ minHeight: "80vh", padding: "40px 20px" }}>
          <div style={{ maxWidth: 540, margin: "0 auto" }}>
            <Card>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase", marginBottom: 8 }}>Etapa {step} de 3</div>
              {step === 1 && (
                <div>
                  <h2 style={{ color: C.forest, fontSize: 20, marginBottom: 16 }}>Identificação da Empresa</h2>
                  <div style={{ display: "grid", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600, display: "block", marginBottom: 4 }}>CNPJ</label>
                      <input style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}`, boxSizing: "border-box" }} value={form.cnpj} onChange={(e) => handleChange("cnpj", e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600, display: "block", marginBottom: 4 }}>Razão Social</label>
                      <input style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}`, boxSizing: "border-box" }} value={form.razaoSocial} onChange={(e) => handleChange("razaoSocial", e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600, display: "block", marginBottom: 4 }}>Nome Fantasia</label>
                      <input style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}`, boxSizing: "border-box" }} value={form.nomeFantasia} onChange={(e) => handleChange("nomeFantasia", e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 style={{ color: C.forest, fontSize: 20, marginBottom: 16 }}>Detalhes da Operação</h2>
                  <div style={{ display: "grid", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600, display: "block", marginBottom: 4 }}>Atividade Principal</label>
                      <input style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}`, boxSizing: "border-box" }} value={form.atividade} onChange={(e) => handleChange("atividade", e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600, display: "block", marginBottom: 4 }}>Geração de Resíduos Industriais/Volume</label>
                      <select style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}`, boxSizing: "border-box" }} value={form.geracaoResiduos} onChange={(e) => handleChange("geracaoResiduos", e.target.value)}>
                        <option value="Sim">Sim, gera resíduos volumosos/perigosos</option>
                        <option value="Não">Não, apenas resíduo comum/comercial</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <h2 style={{ color: C.forest, fontSize: 20, marginBottom: 16 }}>Situação Licenciamento</h2>
                  <div style={{ display: "grid", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.gray600, display: "block", marginBottom: 4 }}>A empresa já possui Licença Ambiental?</label>
                      <select style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}`, boxSizing: "border-box" }} value={form.temLicenca} onChange={(e) => handleChange("temLicenca", e.target.value)}>
                        <option value="Sim">Possui Licença Ativa (LO)</option>
                        <option value="Não">Não possui nenhuma licença</option>
                        <option value="Não tenho certeza">Não tenho certeza / Preciso checar</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                {step > 1 ? <Btn variant="secondary" onClick={() => setStep(step - 1)}>Voltar</Btn> : <Btn variant="ghost" onClick={() => setView("landing")}>Cancelar</Btn>}
                {step < 3 ? <Btn onClick={() => setStep(step + 1)}>Avançar</Btn> : <Btn variant="accent" onClick={handleSubmitOnboarding} disabled={loading}>{loading ? "Gravando..." : "Concluir Diagnóstico"}</Btn>}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TELA: RESULTADO DO DIAGNÓSTICO */}
      {view === "resultado" && (
        <div style={{ minHeight: "80vh", padding: "40px 20px" }}>
          <div style={{ maxWidth: 650, margin: "0 auto" }}>
            <Card style={{ textAlign: "center" }}>
              <Sparkles size={40} color={C.green} style={{ marginBottom: 12 }} />
              <h1 style={{ color: C.forest, fontSize: 24, fontWeight: 800 }}>Diagnóstico Concluído!</h1>
              <p style={{ color: C.gray600, marginTop: 8 }}>
                Cadastramos com sucesso a empresa <strong>{form.nomeFantasia || form.razaoSocial}</strong> em nosso banco de dados.
              </p>

              <div style={{ background: C.paperDim, borderRadius: 12, padding: 16, textAlign: "left", margin: "24px 0", border: `1px solid ${C.line}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.forest, marginBottom: 8, textTransform: "uppercase" }}>Resumo da Situação Ambiental</div>
                <div style={{ display: "grid", gap: 8, fontSize: 14, color: C.gray600 }}>
                  <div>• <strong>CNPJ:</strong> {form.cnpj}</div>
                  <div>• <strong>Atividade:</strong> {form.atividade}</div>
                  <div>• <strong>Status da Licença:</strong> {form.temLicenca}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <Btn size="lg" icon={ArrowRight} onClick={() => {
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
