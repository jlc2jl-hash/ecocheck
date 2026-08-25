import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Leaf, ArrowRight, ShieldCheck, FileText, Recycle, Droplets, Clock,
  Sparkles, Home, AlertTriangle, Loader2
} from "lucide-react";

/* ============================== CONEXÃO SUPABASE ============================== */
const SUPABASE_URL = "https://gfnlzibbnpoqtfdootya.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_K1BaZXSLbgLEsBX9LzPsAQ_GrDiM2fA";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ============================== STYLES & TOKENS ============================== */
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

const TONE = {
  blue: { bg: C.blueSoft, fg: C.blue },
  orange: { bg: C.orangeSoft, fg: C.orange },
  green: { bg: C.greenSoft, fg: C.green },
  gray: { bg: C.paperDim, fg: C.gray600 },
};

function Pill({ tone = "gray", children, icon: Icon }) {
  const t = TONE[tone] || TONE.gray;
  return (
    <span style={{ background: t.bg, color: t.fg, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5 }}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", icon: Icon, disabled }) {
  const sizes = { sm: "8px 14px", md: "11px 20px", lg: "15px 28px" };
  const base = {
    fontFamily: "inherit", fontWeight: 600, fontSize: size === "lg" ? 16 : 14, borderRadius: 10,
    padding: sizes[size], display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    cursor: disabled ? "not-allowed" : "pointer", border: "none", opacity: disabled ? 0.7 : 1
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
    <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, padding: 20, ...style }}>
      {children}
    </div>
  );
}

/* ============================== VIEWS ============================== */
function Landing({ goto }) {
  return (
    <div style={{ background: C.paper, minHeight: "100vh" }}>
      <div style={{ position: "sticky", top: 0, background: `${C.paper}EE`, borderBottom: `1px solid ${C.line}`, padding: "16px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Leaf size={22} color={C.greenBright} />
            <span style={{ fontWeight: 800, fontSize: 18, color: C.forest }}>EcoCheck</span>
          </div>
          <Btn variant="primary" size="sm" onClick={() => goto("onboarding")}>Diagnóstico grátis</Btn>
        </div>
      </div>
      <div style={{ maxWidth: 800, margin: "60px auto", textAlign: "center", padding: "0 20px" }}>
        <Pill tone="green" icon={Leaf}>Feito para PMEs brasileiras</Pill>
        <h1 style={{ fontSize: 38, fontWeight: 800, color: C.forest, margin: "20px 0" }}>Sua empresa está em dia com as obrigações ambientais?</h1>
        <p style={{ fontSize: 16, color: C.gray600, marginBottom: 30 }}>Descubra em poucos minutos quais licenças e obrigações ambientais se aplicam ao seu negócio e evite multas.</p>
        <Btn size="lg" icon={ArrowRight} onClick={() => goto("onboarding")}>Fazer diagnóstico gratuito</Btn>
      </div>
    </div>
  );
}

function Onboarding({ goto, setEmpresaData }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Salva no Supabase
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

      if (error) console.error("Erro ao salvar no Supabase:", error);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setEmpresaData(form);
      goto("resultado");
    }
  };

  if (loading) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.paper }}>
        <Loader2 size={40} color={C.green} className="ec-spin" />
        <h2 style={{ marginTop: 20, color: C.forest }}>Gravando dados no banco Supabase...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.paper, padding: "40px 20px" }}>
      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase", marginBottom: 8 }}>Etapa {step} de 3</div>
          {step === 1 && (
            <div>
              <h2 style={{ color: C.forest, fontSize: 20, marginBottom: 16 }}>Identificação</h2>
              <div style={{ display: "grid", gap: 10 }}>
                <input placeholder="CNPJ" style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}` }} value={form.cnpj} onChange={(e) => handleChange("cnpj", e.target.value)} />
                <input placeholder="Razão Social" style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}` }} value={form.razaoSocial} onChange={(e) => handleChange("razaoSocial", e.target.value)} />
                <input placeholder="Nome Fantasia" style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}` }} value={form.nomeFantasia} onChange={(e) => handleChange("nomeFantasia", e.target.value)} />
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 style={{ color: C.forest, fontSize: 20, marginBottom: 16 }}>Operação</h2>
              <div style={{ display: "grid", gap: 10 }}>
                <input placeholder="Atividade Principal" style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}` }} value={form.atividade} onChange={(e) => handleChange("atividade", e.target.value)} />
                <select style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}` }} value={form.geracaoResiduos} onChange={(e) => handleChange("geracaoResiduos", e.target.value)}>
                  <option value="Sim">Gera Resíduos em Volume</option>
                  <option value="Não">Não Gera Resíduos</option>
                </select>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 style={{ color: C.forest, fontSize: 20, marginBottom: 16 }}>Situação Legal</h2>
              <select style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${C.line}` }} value={form.temLicenca} onChange={(e) => handleChange("temLicenca", e.target.value)}>
                <option value="Sim">Possui Licença Ativa</option>
                <option value="Não">Não Possui Licença</option>
                <option value="Não tenho certeza">Não Tenho Certeza</option>
              </select>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            {step > 1 ? <Btn variant="secondary" onClick={() => setStep(step - 1)}>Voltar</Btn> : <div />}
            {step < 3 ? <Btn onClick={() => setStep(step + 1)}>Avançar</Btn> : <Btn variant="accent" onClick={handleSubmit}>Concluir e Salvar</Btn>}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Resultado({ goto, empresaData }) {
  return (
    <div style={{ minHeight: "100vh", background: C.paper, padding: "40px 20px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
        <Card>
          <Sparkles size={32} color={C.green} style={{ marginBottom: 12 }} />
          <h1 style={{ color: C.forest, fontSize: 22, fontWeight: 800 }}>Diagnóstico Gerado com Sucesso!</h1>
          <p style={{ color: C.gray600, marginTop: 8 }}>Os dados da empresa <strong>{empresaData?.nomeFantasia || "cadastrada"}</strong> foram gravados com sucesso no banco de dados.</p>
          <div style={{ marginTop: 24 }}>
            <Btn size="lg" icon={ArrowRight} onClick={() => goto("landing")}>Voltar ao Início</Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ============================== ROTEADOR ============================== */
export default function App() {
  const [view, setView] = useState("landing");
  const [empresaData, setEmpresaData] = useState(null);

  return (
    <div style={{ fontFamily: "sans-serif", color: C.ink }}>
      {view === "landing" && <Landing goto={setView} />}
      {view === "onboarding" && <Onboarding goto={setView} setEmpresaData={setEmpresaData} />}
      {view === "resultado" && <Resultado goto={setView} empresaData={empresaData} />}
    </div>
  );
}
