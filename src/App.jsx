import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Leaf, ArrowRight, ArrowLeft, Check, X, Menu, Home, ClipboardList,
  FileText, ShieldCheck, Recycle, Droplets, Calendar, BookOpen,
  MessageCircle, Settings, ChevronRight, ChevronDown, Upload,
  AlertTriangle, Clock, Sparkles, Bell, PlayCircle,
  CheckCircle2, CircleDot, FileWarning, FolderOpen, Send, Factory,
  Wind, FlaskConical, ArrowDown, Loader2, LogIn, LogOut, Mail, Lock, User as UserIcon,
} from "lucide-react";

/* ============================== STORAGE HELPERS (demo auth) ============================== */
async function ecStorageGet(key) {
  try { const r = await window.storage.get(key, true); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function ecStorageSet(key, value) {
  try { await window.storage.set(key, JSON.stringify(value), true); return true; }
  catch { return false; }
}

/* ============================== TOKENS ============================== */
const C = {
  forest: "#173C30",
  forestDeep: "#0F2921",
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
  orangeDeep: "#C25A1E",
  white: "#FFFFFF",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
.ec-root, .ec-root * { box-sizing: border-box; }
.ec-root { font-family: 'Inter', sans-serif; color: ${C.ink}; -webkit-font-smoothing: antialiased; }
.ec-display { font-family: 'Sora', sans-serif; }
.ec-mono { font-family: 'JetBrains Mono', monospace; }
.ec-root ::selection { background: ${C.greenBright}; color: white; }
.ec-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
.ec-scroll::-webkit-scrollbar-thumb { background: ${C.line}; border-radius: 3px; }
@keyframes ecFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.ec-fade { animation: ecFadeUp .45s ease both; }
@keyframes ecPulse { 0%,100% { opacity: 1 } 50% { opacity: .55 } }
.ec-pulse { animation: ecPulse 1.5s ease-in-out infinite; }
@keyframes ecSpin { to { transform: rotate(360deg); } }
.ec-spin { animation: ecSpin 1s linear infinite; }
.ec-btn { transition: transform .15s ease, box-shadow .15s ease, background .15s ease, opacity .15s ease; }
.ec-btn:hover { transform: translateY(-1px); }
.ec-btn:active { transform: translateY(0px) scale(.98); }
.ec-card-hover { transition: box-shadow .2s ease, transform .2s ease, border-color .2s ease; }
.ec-card-hover:hover { box-shadow: 0 8px 24px rgba(23,60,48,0.10); transform: translateY(-2px); border-color: ${C.greenBright}55; }
.ec-focus:focus-visible { outline: 2px solid ${C.green}; outline-offset: 2px; }
input.ec-input, select.ec-input, textarea.ec-input {
  width: 100%; border: 1.5px solid ${C.line}; border-radius: 10px; padding: 11px 13px;
  font-family: 'Inter', sans-serif; font-size: 14.5px; background: ${C.white}; color: ${C.ink};
}
input.ec-input:focus, select.ec-input:focus, textarea.ec-input:focus { border-color: ${C.green}; outline: none; box-shadow: 0 0 0 3px ${C.greenSoft}; }
.ec-chip { transition: all .15s ease; cursor: pointer; }
.ec-sidebar-item { transition: background .15s ease, color .15s ease; }
@media (prefers-reduced-motion: reduce) {
  .ec-fade, .ec-pulse, .ec-spin, .ec-btn, .ec-card-hover { animation: none !important; transition: none !important; }
}
`;

/* ============================== FICTIONAL DATA ============================== */
const COMPANY = {
  cnpj: "41.223.870/0001-05",
  razaoSocial: "Construtora Barbosa Ltda.",
  nomeFantasia: "Barbosa Construções",
  estado: "RJ",
  municipio: "Rio de Janeiro",
  atividade: "Construção civil",
  porte: "Pequena empresa",
  area: "1.200 m²",
  funcionarios: "18",
  owner: "João",
};

const LEVEL = "MODERADO"; // BAIXO | MODERADO | ALTO
const POINTS = 5;

const LEVEL_ORDER = ["BAIXO", "MODERADO", "ALTO"];
const LEVEL_TONE = { BAIXO: "green", MODERADO: "blue", ALTO: "orange" };

const RESUMO_CARDS = [
  { key: "licenciamento", icon: ShieldCheck, label: "Licenciamento", value: "2 pontos para verificar", tone: "blue" },
  { key: "documentos", icon: FileText, label: "Documentos", value: "3 documentos não identificados", tone: "orange" },
  { key: "residuos", icon: Recycle, label: "Resíduos", value: "1 ponto de atenção", tone: "blue" },
  { key: "agua", icon: Droplets, label: "Recursos Hídricos", value: "1 ponto para verificar", tone: "blue" },
  { key: "prazos", icon: Clock, label: "Prazos", value: "2 pontos que podem exigir acompanhamento", tone: "orange" },
];

const PENDENCIAS = [
  { id: 1, title: "Verificar situação do licenciamento", area: "Licenciamento", priority: "ALTA",
    detail: "Sua empresa realiza atividade de construção civil em área acima de 1.000 m². Com base nas informações fornecidas, isso costuma exigir algum tipo de licença ambiental municipal ou estadual. Recomendamos verificar a situação junto ao órgão responsável." },
  { id: 2, title: "Organizar documentação de resíduos", area: "Resíduos", priority: "MÉDIA",
    detail: "Você informou que a empresa gera resíduos de construção, mas não encontramos um PGRS (Plano de Gerenciamento de Resíduos Sólidos) cadastrado. Pode ser necessário elaborar e manter esse documento organizado." },
  { id: 3, title: "Verificar situação do uso da água", area: "Recursos Hídricos", priority: "MÉDIA",
    detail: "Sua empresa utiliza um poço como fonte de água, mas não há outorga cadastrada. Recomendamos verificar se a captação exige outorga junto ao órgão gestor de recursos hídricos." },
];

const PRAZOS = [
  { date: "10", month: "SET", title: "Documento ambiental", desc: "Comprovante de destinação de resíduos", status: "Próximo" },
  { date: "15", month: "SET", title: "Condicionante ambiental", desc: "Relatório trimestral da licença", status: "Urgente" },
  { date: "30", month: "SET", title: "Obrigação ambiental", desc: "Renovação da outorga do poço", status: "Próximo" },
];

const CAL_TONE = { "Próximo": "blue", "Urgente": "orange", "Concluído": "green", "Atrasado": "orange" };

const DOCUMENTOS = [
  { name: "Licença de Operação", categoria: "Licenças", status: "Próximo do vencimento", validade: "15/09/2026", upload: "10/01/2026" },
  { name: "PGRS — Plano de Gerenciamento de Resíduos", categoria: "PGRS", status: "Pendente", validade: "—", upload: "—" },
  { name: "MTR — Manifesto de Transporte de Resíduos", categoria: "MTR", status: "Válido", validade: "20/01/2027", upload: "15/01/2026" },
  { name: "Outorga do poço artesiano", categoria: "Outorgas", status: "Vencido", validade: "02/03/2026", upload: "02/03/2023" },
  { name: "CDF — Certificado de Destinação Final", categoria: "CDF", status: "Pendente", validade: "—", upload: "—" },
  { name: "Relatório de monitoramento", categoria: "Relatórios", status: "Válido", validade: "11/06/2027", upload: "11/06/2026" },
  { name: "Laudo de ruído", categoria: "Laudos", status: "Pendente", validade: "—", upload: "—" },
];

const DOC_CATEGORIES = ["Todos", "Licenças", "PGRS", "MTR", "CDF", "Outorgas", "Relatórios", "Laudos", "Certificados", "Outros"];

const ANALYSIS_POINTS = [
  { desc: "Entregar comprovante de destinação de resíduos", prazo: "10/09/2026", priority: "ALTA" },
  { desc: "Atualizar cadastro ambiental municipal", prazo: "15/09/2026", priority: "MÉDIA" },
  { desc: "Apresentar laudo de ruído", prazo: null, priority: "MÉDIA" },
  { desc: "Confirmar responsável técnico no cadastro", prazo: null, priority: "BAIXA" },
  { desc: "Manter cópia do MTR arquivada", prazo: null, priority: "BAIXA" },
  { desc: "Verificar validade da licença antes do vencimento", prazo: null, priority: "MÉDIA" },
];

const TUTORIAIS = [
  { id: "licenca", categoria: "Licenciamento", titulo: "Minha empresa precisa de licença?", tempo: "5 min", icon: ShieldCheck },
  { id: "pgrs", categoria: "Resíduos", titulo: "PGRS: entenda se sua empresa precisa", tempo: "6 min", icon: Recycle },
  { id: "organizar", categoria: "Resíduos", titulo: "Como organizar seus resíduos", tempo: "4 min", icon: FolderOpen },
  { id: "poco", categoria: "Água", titulo: "Tenho um poço. O que preciso verificar?", tempo: "4 min", icon: Droplets },
  { id: "documentos", categoria: "Documentos", titulo: "Como organizar seus documentos ambientais", tempo: "5 min", icon: FileText },
  { id: "fiscalizacao", categoria: "Fiscalização", titulo: "Como se preparar para uma fiscalização", tempo: "7 min", icon: ClipboardList },
];

const PGRS_STEPS = [
  { title: "O que é PGRS?", body: "PGRS é o Plano de Gerenciamento de Resíduos Sólidos: um documento simples que descreve como sua empresa gera, separa, guarda e descarta os resíduos do dia a dia da obra." },
  { title: "Quais resíduos sua empresa gera?", body: "Selecione abaixo os tipos de resíduo presentes na sua operação. Isso define o que precisa entrar no seu plano.", type: "select" },
  { title: "Como os resíduos são armazenados?", body: "Cada tipo de resíduo deve ficar separado, identificado e protegido da chuva até a coleta. Veja um exemplo de armazenamento correto por categoria." },
  { title: "Quem realiza o transporte?", body: "O transporte de resíduos de construção deve ser feito por empresa cadastrada, com emissão de MTR (Manifesto de Transporte de Resíduos) a cada coleta." },
  { title: "Quem recebe os resíduos?", body: "O destino final precisa ser um local licenciado: aterro de inertes, cooperativa de reciclagem ou área de transbordo autorizada — nunca um terreno sem licença." },
  { title: "Quais documentos você deve organizar?", body: "Guarde o MTR de cada coleta, o CDF do destinatário final, comprovantes, contratos com transportadoras e relatórios periódicos. É o que uma fiscalização costuma pedir primeiro.", type: "docs" },
  { title: "Tudo pronto", body: "Você concluiu este tutorial. O próximo passo é organizar o seu PGRS dentro do EcoCheck — nós já aproveitamos boa parte do que você nos contou.", type: "done" },
];

const PLANS = [
  { id: "gratis", name: "Gratuito", price: "R$ 0", period: "sempre", features: ["Diagnóstico básico", "Tutoriais básicos"], cta: "Plano atual", highlight: false },
  { id: "pequena", name: "Pequena Empresa", price: "R$ 39,90", period: "/mês", features: ["Diagnóstico completo", "Documentos", "Calendário", "Alertas de vencimento", "Tutoriais completos"], cta: "Assinar", highlight: false },
  { id: "pro", name: "Profissional", price: "R$ 89,90", period: "/mês", features: ["Tudo do Pequena Empresa", "Assistente de IA", "Análise de documentos", "Condicionantes", "Dashboard avançado"], cta: "Assinar", highlight: true },
  { id: "consultoria", name: "Consultoria", price: "R$ 199,90", period: "/mês", features: ["Gestão de múltiplas empresas", "Dashboard de clientes", "Controle de equipes", "Relatórios"], cta: "Falar com vendas", highlight: false },
];

const VALUE_CARDS = [
  { icon: ShieldCheck, title: "Licenças", desc: "Controle de documentos e vencimentos." },
  { icon: ClipboardList, title: "Obrigações", desc: "Descubra o que precisa ser verificado." },
  { icon: FileText, title: "Documentos", desc: "Organize sua documentação ambiental." },
  { icon: Recycle, title: "Resíduos", desc: "Organize informações e documentos relacionados aos resíduos." },
  { icon: Calendar, title: "Calendário", desc: "Nunca esqueça um prazo." },
  { icon: BookOpen, title: "Tutoriais", desc: "Aprenda como resolver cada etapa." },
  { icon: MessageCircle, title: "Assistente IA", desc: "Entenda documentos e obrigações em linguagem simples." },
];

const FLOW_STEPS = [
  { label: "Empresa", icon: Factory },
  { label: "Diagnóstico", icon: Sparkles },
  { label: "Pendências", icon: AlertTriangle },
  { label: "Tutorial", icon: BookOpen },
  { label: "Documento", icon: FileText },
  { label: "Prazo", icon: Calendar },
  { label: "Acompanhamento", icon: CheckCircle2 },
];

const SIDEBAR = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "diagnostico", label: "Diagnóstico", icon: Sparkles },
  { id: "pendencias", label: "Pendências", icon: AlertTriangle },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "licencas", label: "Licenças", icon: ShieldCheck },
  { id: "residuos", label: "Resíduos", icon: Recycle },
  { id: "obrigacoes", label: "Obrigações", icon: ClipboardList },
  { id: "calendario", label: "Calendário", icon: Calendar },
  { id: "tutoriais", label: "Tutoriais", icon: BookOpen },
  { id: "assistente", label: "Assistente IA", icon: MessageCircle },
  { id: "configuracoes", label: "Configurações", icon: Settings },
];

const MOBILE_TABS = [
  { id: "dashboard", label: "Início", icon: Home },
  { id: "pendencias", label: "Pendências", icon: AlertTriangle },
  { id: "documentos", label: "Docs", icon: FileText },
  { id: "assistente", label: "IA", icon: MessageCircle },
];

/* ============================== SHARED UI ============================== */
const TONE = {
  blue: { bg: C.blueSoft, fg: C.blue },
  orange: { bg: C.orangeSoft, fg: C.orange },
  green: { bg: C.greenSoft, fg: C.green },
  gray: { bg: C.paperDim, fg: C.gray600 },
};

function Pill({ tone = "gray", children, icon: Icon }) {
  const t = TONE[tone];
  return (
    <span style={{ background: t.bg, color: t.fg, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}

function statusTone(status) {
  if (status === "Válido") return "green";
  if (status === "Próximo do vencimento") return "blue";
  if (status === "Vencido") return "orange";
  return "gray";
}

function PriorityPill({ p }) {
  const map = { ALTA: "orange", MÉDIA: "blue", BAIXA: "gray" };
  return <Pill tone={map[p] || "gray"}>{p}</Pill>;
}

function Btn({ children, onClick, variant = "primary", size = "md", icon: Icon, full, style, type = "button" }) {
  const sizes = { sm: "8px 14px", md: "11px 20px", lg: "15px 28px" };
  const fs = { sm: 13, md: 14.5, lg: 16 };
  const base = {
    fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: fs[size], borderRadius: 10,
    padding: sizes[size], display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    cursor: "pointer", border: "none", width: full ? "100%" : "auto", ...style,
  };
  const variants = {
    primary: { background: C.forest, color: C.white, boxShadow: "0 1px 2px rgba(23,60,48,.15)" },
    accent: { background: C.orange, color: C.white },
    secondary: { background: C.white, color: C.forest, border: `1.5px solid ${C.line}` },
    ghost: { background: "transparent", color: C.forest },
    subtle: { background: C.greenSoft, color: C.green },
  };
  return (
    <button type={type} onClick={onClick} className="ec-btn ec-focus" style={{ ...base, ...variants[variant] }}>
      {children}
      {Icon && <Icon size={size === "lg" ? 18 : 16} />}
    </button>
  );
}

function Card({ children, style, className = "", onClick }) {
  return (
    <div onClick={onClick} className={`ec-card-hover ${className}`} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ eyebrow, title, sub, center }) {
  return (
    <div style={{ textAlign: center ? "center" : "left", marginBottom: 36 }}>
      {eyebrow && (
        <div className="ec-mono" style={{ color: C.green, fontSize: 12.5, fontWeight: 500, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>
          {eyebrow}
        </div>
      )}
      <h2 className="ec-display" style={{ fontSize: "clamp(24px,3.4vw,34px)", fontWeight: 700, color: C.forest, letterSpacing: -0.5, margin: 0 }}>
        {title}
      </h2>
      {sub && <p style={{ color: C.gray600, fontSize: 15.5, marginTop: 10, maxWidth: 560, marginLeft: center ? "auto" : 0, marginRight: center ? "auto" : 0, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

/* ---- Level gauge (signature element) ---- */
function LevelBar({ level, size = "md" }) {
  const h = size === "lg" ? 12 : 9;
  return (
    <div style={{ display: "flex", gap: 6, width: "100%" }}>
      {LEVEL_ORDER.map((l) => {
        const active = l === level;
        const t = TONE[LEVEL_TONE[l]];
        return (
          <div key={l} style={{ flex: 1 }}>
            <div style={{ height: h, borderRadius: 999, background: active ? t.fg : C.paperDim, transition: "background .4s ease" }} />
            <div className="ec-mono" style={{ fontSize: 10, fontWeight: 700, textAlign: "center", marginTop: 7, color: active ? t.fg : C.gray400, letterSpacing: 0.5 }}>{l}</div>
          </div>
        );
      })}
    </div>
  );
}

function LevelBadge({ level = LEVEL, points = POINTS, subLabel = "para verificar", size = "lg" }) {
  const t = TONE[LEVEL_TONE[level]];
  return (
    <div style={{ textAlign: "center", width: "100%" }}>
      <div className="ec-mono" style={{ fontSize: 11.5, color: C.gray600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>
        Nível de atenção ambiental
      </div>
      <div className="ec-display" style={{ fontSize: size === "lg" ? 32 : 24, fontWeight: 800, color: t.fg, letterSpacing: 0.5 }}>{level}</div>
      {points != null && <div style={{ fontSize: 13, color: C.gray600, marginTop: 6 }}>{points} pontos {subLabel}</div>}
      <div style={{ marginTop: 18 }}><LevelBar level={level} size={size} /></div>
    </div>
  );
}

/* ============================== LANDING PAGE ============================== */
function Landing({ goto }) {
  return (
    <div style={{ background: C.paper }}>
      {/* NAV */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, background: `${C.paper}EE`, backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.line}` }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: C.forest, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Leaf size={18} color={C.greenBright} />
            </div>
            <span className="ec-display" style={{ fontWeight: 700, fontSize: 19, color: C.forest }}>EcoCheck</span>
          </div>
          <div className="ec-hide-mobile" style={{ display: "flex", gap: 28, fontSize: 14.5, fontWeight: 500, color: C.gray600 }}>
            <span>Como funciona</span><span>O que você acompanha</span><span>Planos</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <div className="ec-hide-mobile"><Btn variant="ghost" size="sm" onClick={() => goto("auth", "login")}>Entrar</Btn></div>
            <Btn variant="primary" size="sm" onClick={() => goto("onboarding")}>Diagnóstico grátis</Btn>
          </div>
        </div>
      </div>

      {/* HERO */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "72px 24px 40px", display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 56, alignItems: "center" }} className="ec-hero-grid">
        <div className="ec-fade">
          <Pill tone="green" icon={Leaf}>Feito para PMEs brasileiras</Pill>
          <h1 className="ec-display" style={{ fontSize: "clamp(30px,4.4vw,48px)", fontWeight: 800, color: C.forest, lineHeight: 1.1, letterSpacing: -1, margin: "20px 0 20px" }}>
            Sua empresa está em dia com as obrigações ambientais?
          </h1>
          <p style={{ fontSize: 17, color: C.gray600, lineHeight: 1.65, maxWidth: 520 }}>
            Descubra em poucos minutos quais obrigações ambientais podem se aplicar à sua empresa, quais documentos precisam de atenção e o que você deve verificar.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
            <Btn size="lg" icon={ArrowRight} onClick={() => goto("onboarding")}>Fazer diagnóstico gratuito</Btn>
            <Btn size="lg" variant="secondary" onClick={() => { const el = document.getElementById("como-funciona"); el && el.scrollIntoView({ behavior: "smooth" }); }}>Como funciona</Btn>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: C.gray400 }}>Sem compromisso. Diagnóstico inicial gratuito.</div>
        </div>
        <div className="ec-fade" style={{ animationDelay: ".1s" }}>
          <Card style={{ padding: 26, boxShadow: "0 24px 60px rgba(23,60,48,.14)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12.5, color: C.gray400, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6 }}>{COMPANY.nomeFantasia}</div>
                <div style={{ fontSize: 13, color: C.gray400, marginTop: 2 }}>{COMPANY.municipio}/{COMPANY.estado} · {COMPANY.atividade}</div>
              </div>
              <Pill tone="blue">Diagnóstico</Pill>
            </div>
            <LevelBadge />
            <div style={{ display: "grid", gap: 8, marginTop: 20 }}>
              {[["3 pendências", AlertTriangle], ["2 documentos próximos do vencimento", Clock], ["1 obrigação próxima", ClipboardList]].map(([label, Icon]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderRadius: 10, background: C.paperDim }}>
                  <Icon size={15} color={C.forest} />
                  <div style={{ fontSize: 12.8, fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, fontSize: 11, color: C.gray400, lineHeight: 1.5 }}>
              O diagnóstico é uma avaliação inicial baseada nas informações fornecidas e não substitui avaliação técnica ou jurídica.
            </div>
          </Card>
        </div>
      </div>

      {/* 3 STEPS */}
      <div id="como-funciona" style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 24px" }}>
        <SectionLabel eyebrow="Como funciona" title="Três passos até o seu diagnóstico" center />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="ec-grid-3">
          {[
            { n: "01", t: "Informe sua empresa", d: "CNPJ, atividade e localização — leva menos de um minuto." },
            { n: "02", t: "Responda perguntas simples", d: "O sistema adapta as perguntas de acordo com suas respostas." },
            { n: "03", t: "Receba seu diagnóstico", d: "Veja os pontos que precisam de atenção e saiba como começar a resolver." },
          ].map((s) => (
            <Card key={s.n} style={{ padding: 26 }}>
              <div className="ec-display ec-mono" style={{ fontSize: 13, color: C.greenBright, fontWeight: 700, letterSpacing: 1 }}>{s.n}</div>
              <div className="ec-display" style={{ fontSize: 18, fontWeight: 700, color: C.forest, margin: "10px 0 8px" }}>{s.t}</div>
              <div style={{ fontSize: 14, color: C.gray600, lineHeight: 1.55 }}>{s.d}</div>
            </Card>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 30 }}>
          <Btn variant="secondary" icon={ArrowRight} onClick={() => goto("onboarding")}>Fazer diagnóstico gratuito</Btn>
        </div>
      </div>

      {/* PROPOSTA DE VALOR */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 24px 64px" }}>
        <SectionLabel eyebrow="O que você acompanha" title="Tudo que sua empresa precisa acompanhar em um só lugar." center />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }} className="ec-grid-4">
          {VALUE_CARDS.map((b) => (
            <Card key={b.title} style={{ padding: 22 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 13 }}>
                <b.icon size={19} color={C.green} />
              </div>
              <div className="ec-display" style={{ fontWeight: 700, fontSize: 15, color: C.forest, marginBottom: 6 }}>{b.title}</div>
              <div style={{ fontSize: 13.3, color: C.gray600, lineHeight: 1.5 }}>{b.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* CONCEITO CENTRAL + FLOW */}
      <div style={{ background: C.forest, margin: "20px 0" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "68px 24px", display: "grid", gridTemplateColumns: "1fr 0.85fr", gap: 48, alignItems: "center" }} className="ec-hero-grid">
          <div>
            <div className="ec-mono" style={{ color: C.greenBright, fontSize: 12.5, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Seu departamento ambiental digital</div>
            <h2 className="ec-display" style={{ fontSize: "clamp(24px,3.2vw,32px)", fontWeight: 700, color: C.white, lineHeight: 1.25, marginBottom: 16 }}>
              Você não precisa entender toda a legislação ambiental para saber o que precisa fazer.
            </h2>
            <p style={{ color: "#C9D6CE", fontSize: 15, lineHeight: 1.65, marginBottom: 24 }}>
              Conte ao EcoCheck como sua empresa funciona. Nós organizamos as informações, mostramos os pontos que merecem atenção e explicamos o próximo passo.
            </p>
            <Btn variant="accent" icon={ArrowRight} onClick={() => goto("onboarding")}>Fazer diagnóstico gratuito</Btn>
          </div>
          <FlowDiagram />
        </div>
      </div>

      {/* PLANS */}
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "64px 24px 80px" }}>
        <SectionLabel eyebrow="Planos" title="Comece de graça, cresça quando quiser" sub="O diagnóstico inicial é 100% gratuito. Faça o teste sem compromisso." center />
        <PlansGrid goto={goto} />
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: `1px solid ${C.line}`, padding: "28px 24px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.gray400, fontSize: 13 }}>
            <Leaf size={14} /> EcoCheck — protótipo para validação de mercado
          </div>
          <div style={{ fontSize: 12.5, color: C.gray400 }}>© 2026 EcoCheck. Todos os direitos reservados.</div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .ec-hero-grid { grid-template-columns: 1fr !important; }
          .ec-grid-3 { grid-template-columns: 1fr !important; }
          .ec-grid-4 { grid-template-columns: 1fr 1fr !important; }
          .ec-hide-mobile { display: none !important; }
        }
        @media (max-width: 480px) { .ec-grid-4 { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function FlowDiagram() {
  return (
    <div style={{ background: C.forestDeep, border: "1px solid #2A4B3D", borderRadius: 16, padding: "22px 24px" }}>
      {FLOW_STEPS.map((s, i) => (
        <div key={s.label}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0" }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "#1E4636", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={15} color={C.greenBright} />
            </div>
            <span style={{ color: "white", fontSize: 13.8, fontWeight: 600 }}>{s.label}</span>
          </div>
          {i < FLOW_STEPS.length - 1 && (
            <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: 15 }}>
              <ArrowDown size={13} color="#4C6E5C" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function PlansGrid({ goto }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }} className="ec-plans-grid">
      {PLANS.map((p) => (
        <Card key={p.id} style={{
          padding: 24, display: "flex", flexDirection: "column",
          border: p.highlight ? `2px solid ${C.green}` : `1px solid ${C.line}`,
          position: "relative", background: p.highlight ? C.greenSoft : C.white,
        }}>
          {p.highlight && <div style={{ position: "absolute", top: -11, left: 20, background: C.green, color: "white", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>MAIS ESCOLHIDO</div>}
          <div className="ec-display" style={{ fontWeight: 700, fontSize: 16, color: C.forest }}>{p.name}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "12px 0 4px" }}>
            <span className="ec-display" style={{ fontSize: 26, fontWeight: 800, color: C.forest }}>{p.price}</span>
            <span style={{ fontSize: 13, color: C.gray600 }}>{p.period}</span>
          </div>
          <div style={{ height: 1, background: C.line, margin: "14px 0" }} />
          <div style={{ display: "grid", gap: 9, flex: 1 }}>
            {p.features.map((f) => (
              <div key={f} style={{ display: "flex", gap: 8, fontSize: 13.3, color: C.gray600 }}>
                <Check size={15} color={C.green} style={{ flexShrink: 0, marginTop: 1 }} /> {f}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <Btn full variant={p.highlight ? "primary" : "secondary"} onClick={() => goto("onboarding")}>{p.cta}</Btn>
          </div>
        </Card>
      ))}
      <div className="ec-mono" style={{ gridColumn: "1 / -1", textAlign: "center", fontSize: 11.5, color: C.gray400, marginTop: 4 }}>
        Valores de demonstração para este protótipo e podem ser alterados.
      </div>
      <style>{`@media (max-width: 900px) { .ec-plans-grid { grid-template-columns: 1fr 1fr !important; } } @media (max-width: 560px) { .ec-plans-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

/* ============================== ONBOARDING ============================== */
const LOADING_MESSAGES = ["Analisando suas respostas…", "Organizando os pontos que precisam de atenção…", "Seu diagnóstico está pronto."];

function Onboarding({ goto }) {
  const [stage, setStage] = useState(1);
  const [a, setA] = useState({
    cnpj: COMPANY.cnpj, razaoSocial: COMPANY.razaoSocial, nomeFantasia: COMPANY.nomeFantasia,
    estado: COMPANY.estado, municipio: COMPANY.municipio, atividade: COMPANY.atividade,
    porte: COMPANY.porte, area: COMPANY.area, funcionarios: COMPANY.funcionarios,
    usaAgua: "", origemAgua: "", outorga: "",
    geraResiduos: "", categoriasResiduos: [],
    efluentes: "",
    licenca: "", numLicenca: "", orgao: "", dataEmissao: "", dataValidade: "", condicionantes: "",
    quimicos: "", emissoes: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const totalStages = 7;

  const set = (k, v) => setA((p) => ({ ...p, [k]: v }));
  const toggleArr = (k, v) => setA((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));

  const next = () => (stage < totalStages ? setStage(stage + 1) : submit());
  const back = () => (stage > 1 ? setStage(stage - 1) : goto("landing"));

  const submit = () => setLoading(true);

  useEffect(() => {
    if (!loading) return;
    const t1 = setTimeout(() => setLoadingStep(1), 1000);
    const t2 = setTimeout(() => setLoadingStep(2), 2000);
    const t3 = setTimeout(() => goto("resultado"), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [loading]);

  const canAdvance = useMemo(() => (stage === 1 ? a.cnpj && a.razaoSocial && a.municipio : true), [stage, a]);

  if (loading) {
    return (
      <FullScreenCenter>
        <div className="ec-fade" style={{ textAlign: "center", maxWidth: 340 }}>
          <div className="ec-pulse" style={{ display: "inline-flex", padding: 20, borderRadius: 20, background: C.greenSoft, marginBottom: 22 }}>
            <Loader2 size={28} color={C.green} className="ec-spin" />
          </div>
          <div key={loadingStep} className="ec-fade ec-display" style={{ fontSize: 18, fontWeight: 700, color: C.forest, minHeight: 26 }}>
            {LOADING_MESSAGES[loadingStep]}
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 20 }}>
            {LOADING_MESSAGES.map((_, i) => (
              <div key={i} style={{ width: 26, height: 4, borderRadius: 999, background: i <= loadingStep ? C.green : C.paperDim, transition: "background .3s" }} />
            ))}
          </div>
        </div>
      </FullScreenCenter>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.paper, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.line}` }}>
        <button onClick={back} className="ec-btn ec-focus" style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: C.gray600, cursor: "pointer", fontSize: 14 }}>
          <ArrowLeft size={16} /> Voltar
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Leaf size={16} color={C.green} />
          <span className="ec-display" style={{ fontWeight: 700, color: C.forest, fontSize: 15 }}>EcoCheck</span>
        </div>
        <div style={{ width: 60 }} />
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", width: "100%", padding: "34px 24px 100px", flex: 1 }}>
        <div className="ec-mono" style={{ fontSize: 12, color: C.green, fontWeight: 600, letterSpacing: 0.6, marginBottom: 8 }}>
          ETAPA {stage} DE {totalStages}
        </div>
        <div style={{ height: 6, background: C.paperDim, borderRadius: 999, overflow: "hidden", marginBottom: 32 }}>
          <div style={{ height: "100%", width: `${(stage / totalStages) * 100}%`, background: C.greenBright, borderRadius: 999, transition: "width .4s ease" }} />
        </div>

        <div key={stage} className="ec-fade">
          {stage === 1 && <StageEmpresa a={a} set={set} />}
          {stage === 2 && <StageAgua a={a} set={set} />}
          {stage === 3 && <StageResiduos a={a} set={set} toggleArr={toggleArr} />}
          {stage === 4 && <StageEfluentes a={a} set={set} />}
          {stage === 5 && <StageLicenciamento a={a} set={set} />}
          {stage === 6 && <StageQuimicos a={a} set={set} />}
          {stage === 7 && <StageEmissoes a={a} set={set} />}
        </div>
      </div>

      <div style={{ position: "sticky", bottom: 0, background: `${C.paper}F5`, backdropFilter: "blur(6px)", borderTop: `1px solid ${C.line}`, padding: "16px 24px" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", justifyContent: "flex-end" }}>
          <Btn size="lg" icon={stage === totalStages ? Sparkles : ArrowRight} onClick={next} style={{ opacity: canAdvance ? 1 : 0.5, pointerEvents: canAdvance ? "auto" : "none" }}>
            {stage === totalStages ? "Ver meu diagnóstico" : "Continuar"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function FullScreenCenter({ children }) {
  return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.paper, padding: 24 }}>{children}</div>;
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.forest, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function OptionRow({ options, value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className="ec-chip ec-focus" style={{
          padding: "11px 20px", borderRadius: 11, fontSize: 14.5, fontWeight: 600,
          border: `1.5px solid ${value === o ? C.green : C.line}`,
          background: value === o ? C.greenSoft : C.white, color: value === o ? C.green : C.ink,
        }}>{o}</button>
      ))}
    </div>
  );
}

function QTitle({ children }) {
  return <h3 className="ec-display" style={{ fontSize: 22, fontWeight: 700, color: C.forest, margin: "6px 0 2px" }}>{children}</h3>;
}

function StageEmpresa({ a, set }) {
  return (
    <div>
      <QTitle>Vamos conhecer sua empresa.</QTitle>
      <p style={{ color: C.gray600, fontSize: 14.5, marginBottom: 24 }}>Esses dados ajudam a identificar quais regras se aplicam ao seu negócio.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="ec-form-grid">
        <Field label="CNPJ"><input className="ec-input ec-mono" value={a.cnpj} onChange={(e) => set("cnpj", e.target.value)} /></Field>
        <Field label="Razão social"><input className="ec-input" value={a.razaoSocial} onChange={(e) => set("razaoSocial", e.target.value)} /></Field>
        <Field label="Nome fantasia"><input className="ec-input" value={a.nomeFantasia} onChange={(e) => set("nomeFantasia", e.target.value)} /></Field>
        <Field label="Estado"><input className="ec-input" value={a.estado} onChange={(e) => set("estado", e.target.value)} /></Field>
        <Field label="Município"><input className="ec-input" value={a.municipio} onChange={(e) => set("municipio", e.target.value)} /></Field>
        <Field label="Atividade principal"><input className="ec-input" value={a.atividade} onChange={(e) => set("atividade", e.target.value)} /></Field>
        <Field label="Porte">
          <select className="ec-input" value={a.porte} onChange={(e) => set("porte", e.target.value)}>
            {["Microempresa", "Pequena empresa", "Média empresa", "Grande empresa"].map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Área aproximada"><input className="ec-input" value={a.area} onChange={(e) => set("area", e.target.value)} /></Field>
        <Field label="Número de funcionários"><input className="ec-input" value={a.funcionarios} onChange={(e) => set("funcionarios", e.target.value)} /></Field>
      </div>
      <style>{`@media (max-width: 560px) { .ec-form-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function StageAgua({ a, set }) {
  return (
    <div>
      <QTitle>Agora vamos entender como sua empresa funciona.</QTitle>
      <p style={{ color: C.gray600, fontSize: 13.5, marginBottom: 10 }}>Sua empresa utiliza água?</p>
      <OptionRow options={["Sim", "Não", "Não sei"]} value={a.usaAgua} onChange={(v) => set("usaAgua", v)} />
      {a.usaAgua === "Sim" && (
        <div className="ec-fade" style={{ marginTop: 30 }}>
          <QTitle>Qual é a origem da água?</QTitle>
          <OptionRow options={["Rede pública", "Poço", "Captação superficial", "Outra", "Não sei"]} value={a.origemAgua} onChange={(v) => set("origemAgua", v)} />
        </div>
      )}
      {a.origemAgua === "Poço" && (
        <div className="ec-fade" style={{ marginTop: 30 }}>
          <QTitle>Você possui autorização ou outorga?</QTitle>
          <OptionRow options={["Sim", "Não", "Não sei"]} value={a.outorga} onChange={(v) => set("outorga", v)} />
        </div>
      )}
    </div>
  );
}

function StageResiduos({ a, set, toggleArr }) {
  const cats = ["Recicláveis", "Orgânicos", "Resíduos de construção", "Resíduos industriais", "Resíduos perigosos", "Outros"];
  return (
    <div>
      <QTitle>Sua empresa gera resíduos?</QTitle>
      <OptionRow options={["Sim", "Não", "Não sei"]} value={a.geraResiduos} onChange={(v) => set("geraResiduos", v)} />
      {a.geraResiduos === "Sim" && (
        <div className="ec-fade" style={{ marginTop: 30 }}>
          <p style={{ color: C.gray600, fontSize: 13.5, marginBottom: 4 }}>Selecione todas as categorias que fizerem sentido.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            {cats.map((c) => {
              const on = a.categoriasResiduos.includes(c);
              return (
                <button key={c} onClick={() => toggleArr("categoriasResiduos", c)} className="ec-chip ec-focus" style={{
                  padding: "10px 16px", borderRadius: 10, fontSize: 13.8, fontWeight: 600,
                  border: `1.5px solid ${on ? C.green : C.line}`, background: on ? C.greenSoft : C.white, color: on ? C.green : C.ink,
                  display: "flex", alignItems: "center", gap: 7,
                }}>
                  {on && <Check size={13} />} {c}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StageEfluentes({ a, set }) {
  return (
    <div>
      <QTitle>Sua empresa gera efluentes líquidos?</QTitle>
      <p style={{ color: C.gray600, fontSize: 13.5, marginBottom: 4 }}>Por exemplo: água usada em processos, lavagem de equipamentos ou esgoto sanitário fora da rede.</p>
      <OptionRow options={["Sim", "Não", "Não sei"]} value={a.efluentes} onChange={(v) => set("efluentes", v)} />
    </div>
  );
}

function StageLicenciamento({ a, set }) {
  return (
    <div>
      <QTitle>A empresa possui licença ambiental?</QTitle>
      <OptionRow options={["Sim", "Não", "Não sei"]} value={a.licenca} onChange={(v) => set("licenca", v)} />

      {a.licenca === "Sim" && (
        <div className="ec-fade" style={{ marginTop: 28, background: C.paperDim, borderRadius: 14, padding: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="ec-form-grid">
            <Field label="Número da licença"><input className="ec-input" value={a.numLicenca} onChange={(e) => set("numLicenca", e.target.value)} placeholder="Ex: LO 09/2023" /></Field>
            <Field label="Órgão emissor"><input className="ec-input" value={a.orgao} onChange={(e) => set("orgao", e.target.value)} placeholder="Ex: INEA" /></Field>
            <Field label="Data de emissão"><input type="date" className="ec-input" value={a.dataEmissao} onChange={(e) => set("dataEmissao", e.target.value)} /></Field>
            <Field label="Data de validade"><input type="date" className="ec-input" value={a.dataValidade} onChange={(e) => set("dataValidade", e.target.value)} /></Field>
          </div>
          <Field label="Upload do documento">
            <div style={{ border: `1.5px dashed ${C.line}`, borderRadius: 10, padding: "18px", textAlign: "center", color: C.gray600, fontSize: 13.5, background: C.white }}>
              <Upload size={18} style={{ marginBottom: 6 }} /><br /> Arraste o arquivo ou clique para enviar
            </div>
          </Field>
          <div style={{ marginTop: 18 }}>
            <QTitle>A licença possui condicionantes?</QTitle>
            <OptionRow options={["Sim", "Não", "Não sei"]} value={a.condicionantes} onChange={(v) => set("condicionantes", v)} />
          </div>
        </div>
      )}
    </div>
  );
}

function StageQuimicos({ a, set }) {
  return (
    <div>
      <QTitle>Sua empresa utiliza ou armazena produtos químicos?</QTitle>
      <p style={{ color: C.gray600, fontSize: 13.5, marginBottom: 4 }}>Combustíveis, solventes, tintas ou outros produtos controlados.</p>
      <OptionRow options={["Sim", "Não", "Não sei"]} value={a.quimicos} onChange={(v) => set("quimicos", v)} />
    </div>
  );
}

function StageEmissoes({ a, set }) {
  return (
    <div>
      <QTitle>Sua empresa possui alguma atividade que gere emissões atmosféricas, ruído ou vibração?</QTitle>
      <p style={{ color: C.gray600, fontSize: 13.5, marginBottom: 4 }}>Por exemplo: geradores, britadores, compressores ou maquinário pesado.</p>
      <OptionRow options={["Sim", "Não", "Não sei"]} value={a.emissoes} onChange={(v) => set("emissoes", v)} />
    </div>
  );
}

/* ============================== DIAGNOSTIC RESULT ============================== */
function Resultado({ goto }) {
  return (
    <div style={{ minHeight: "100vh", background: C.paper }}>
      <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Leaf size={16} color={C.green} /><span className="ec-display" style={{ fontWeight: 700, color: C.forest, fontSize: 15 }}>EcoCheck</span>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px 90px" }} className="ec-fade">
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h1 className="ec-display" style={{ fontSize: "clamp(24px,4vw,32px)", fontWeight: 800, color: C.forest }}>Seu diagnóstico ambiental está pronto.</h1>
          <div style={{ color: C.gray600, fontSize: 15, marginTop: 8 }}>{COMPANY.nomeFantasia} · {COMPANY.municipio}/{COMPANY.estado}</div>
        </div>

        <Card style={{ maxWidth: 420, margin: "0 auto 18px", padding: "26px 28px" }}>
          <LevelBadge />
        </Card>
        <div style={{ textAlign: "center", fontSize: 14.5, color: C.ink, fontWeight: 600, marginBottom: 24 }}>
          Identificamos {POINTS} pontos que merecem verificação.
        </div>

        <div style={{ maxWidth: 480, margin: "0 auto 36px", background: C.blueSoft, borderRadius: 12, padding: "13px 16px", display: "flex", gap: 10 }}>
          <FileWarning size={17} color={C.blue} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: 12.8, color: "#2C5384", lineHeight: 1.55 }}>
            O diagnóstico é uma avaliação inicial baseada nas informações fornecidas e não substitui avaliação técnica ou jurídica.
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 40 }} className="ec-resumo-grid">
          {RESUMO_CARDS.map((r) => (
            <Card key={r.key} style={{ padding: 16, textAlign: "center" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: TONE[r.tone].bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
                <r.icon size={16} color={TONE[r.tone].fg} />
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.forest }}>{r.label}</div>
              <div style={{ fontSize: 11.5, color: C.gray600, marginTop: 4 }}>{r.value}</div>
            </Card>
          ))}
        </div>

        <SectionLabel eyebrow="Prioridades" title="Comece por aqui" />
        <div style={{ display: "grid", gap: 12 }}>
          {PENDENCIAS.map((p) => (
            <Card key={p.id} style={{ padding: 18, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle size={17} color={C.orange} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: C.ink }}>{p.title}</div>
                <div style={{ marginTop: 6 }}><PriorityPill p={p.priority} /></div>
              </div>
              <Btn variant="secondary" size="sm" onClick={() => goto("pendencias")}>Ver como resolver</Btn>
            </Card>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 46 }}>
          <Btn size="lg" icon={ArrowRight} onClick={() => goto("auth", "signup")}>Quero organizar minha empresa</Btn>
        </div>
      </div>
      <style>{`@media (max-width: 760px) { .ec-resumo-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
    </div>
  );
}

/* ============================== AUTENTICAÇÃO (demo) ============================== */
function AuthPage({ mode, setMode, goto, onAuthed }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Preencha e-mail e senha."); return; }
    setLoading(true);
    const key = `ecocheck:user:${email.trim().toLowerCase()}`;
    if (mode === "signup") {
      if (!name || !company) { setLoading(false); setError("Preencha todos os campos."); return; }
      const existing = await ecStorageGet(key);
      if (existing) { setLoading(false); setError("Já existe uma conta com este e-mail. Faça login."); return; }
      const user = { name, company, email: email.trim().toLowerCase(), password };
      const ok = await ecStorageSet(key, user);
      setLoading(false);
      if (!ok) { setError("Não foi possível criar a conta agora. Tente novamente."); return; }
      onAuthed(user);
    } else {
      const existing = await ecStorageGet(key);
      setLoading(false);
      if (!existing || existing.password !== password) { setError("E-mail ou senha incorretos."); return; }
      onAuthed(existing);
    }
  };

  return (
    <FullScreenCenter>
      <div className="ec-fade" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 24 }}>
          <Leaf size={18} color={C.green} /><span className="ec-display" style={{ fontWeight: 700, color: C.forest, fontSize: 17 }}>EcoCheck</span>
        </div>
        <Card style={{ padding: 28 }}>
          <div style={{ display: "flex", background: C.paperDim, borderRadius: 10, padding: 4, marginBottom: 22 }}>
            {[["login", "Entrar"], ["signup", "Criar conta"]].map(([id, label]) => (
              <button key={id} onClick={() => { setMode(id); setError(""); }} className="ec-focus" style={{
                flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 13.5,
                background: mode === id ? C.white : "transparent", color: mode === id ? C.forest : C.gray600,
                boxShadow: mode === id ? "0 1px 3px rgba(0,0,0,.08)" : "none",
              }}>{label}</button>
            ))}
          </div>

          <h2 className="ec-display" style={{ fontSize: 19, fontWeight: 700, color: C.forest, marginBottom: 4 }}>
            {mode === "signup" ? "Crie sua conta gratuita" : "Bem-vindo de volta"}
          </h2>
          <p style={{ fontSize: 13, color: C.gray600, marginBottom: 20 }}>
            {mode === "signup" ? "Salve seu diagnóstico e organize sua empresa." : "Entre para ver seu painel ambiental."}
          </p>

          <form onSubmit={submit}>
            {mode === "signup" && (
              <>
                <Field label="Seu nome"><input className="ec-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: João Barbosa" /></Field>
                <Field label="Nome da empresa"><input className="ec-input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ex: Construtora Barbosa Ltda." /></Field>
              </>
            )}
            <Field label="E-mail"><input type="email" className="ec-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com.br" /></Field>
            <Field label="Senha"><input type="password" className="ec-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></Field>
            {error && <div style={{ background: C.orangeSoft, color: C.orangeDeep, fontSize: 12.5, padding: "9px 12px", borderRadius: 9, marginBottom: 14 }}>{error}</div>}
            <Btn full size="lg" type="submit" icon={mode === "signup" ? UserIcon : LogIn} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? "Aguarde…" : mode === "signup" ? "Criar conta" : "Entrar"}
            </Btn>
          </form>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <button onClick={() => goto("dashboard")} className="ec-focus" style={{ background: "none", border: "none", color: C.gray400, fontSize: 12.5, cursor: "pointer", textDecoration: "underline" }}>
              Continuar com dados de demonstração
            </button>
          </div>
        </Card>
        <div className="ec-mono" style={{ textAlign: "center", fontSize: 10.5, color: C.gray400, marginTop: 14, lineHeight: 1.5 }}>
          Protótipo — armazenamento de demonstração, não utilize senhas reais.
        </div>
      </div>
    </FullScreenCenter>
  );
}

/* ============================== APP SHELL (dashboard area) ============================== */
function AppShell({ page, setPage, currentUser, onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: C.paperDim, display: "flex" }}>
      <div className="ec-hide-mobile" style={{ width: 236, background: C.forest, flexShrink: 0, display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1E4636", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Leaf size={16} color={C.greenBright} />
          </div>
          <span className="ec-display" style={{ fontWeight: 700, fontSize: 16.5, color: C.white }}>EcoCheck</span>
        </div>
        <div className="ec-scroll" style={{ flex: 1, overflowY: "auto", padding: "6px 12px" }}>
          {SIDEBAR.map((s) => {
            const active = page === s.id;
            return (
              <div key={s.id} onClick={() => setPage(s.id)} className="ec-sidebar-item ec-focus" tabIndex={0} style={{
                display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 9, cursor: "pointer",
                marginBottom: 2, background: active ? "#1E4636" : "transparent", color: active ? C.white : "#B7C6BC",
              }}>
                <s.icon size={16} color={active ? C.greenBright : "#8CA394"} />
                <span style={{ fontSize: 13.6, fontWeight: 500 }}>{s.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "12px 16px 16px", borderTop: "1px solid #24493B" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: C.greenBright, display: "flex", alignItems: "center", justifyContent: "center", color: C.forest, fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {(currentUser?.name || COMPANY.owner)[0]}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: C.white, fontSize: 12.8, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser?.name || COMPANY.owner}</div>
              <div style={{ color: "#8CA394", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentUser?.company || COMPANY.nomeFantasia}</div>
            </div>
          </div>
          <button onClick={onLogout} className="ec-focus" style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "#8CA394", fontSize: 12.3, cursor: "pointer", padding: "4px 2px" }}>
            <LogOut size={14} /> Sair
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <div className="ec-mobile-topbar" style={{ display: "none", padding: "14px 18px", background: C.forest, color: "white", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Leaf size={16} color={C.greenBright} /><span className="ec-display" style={{ fontWeight: 700 }}>EcoCheck</span>
          </div>
          <button className="ec-focus" onClick={() => setMobileOpen(true)} style={{ background: "none", border: "none", color: "white" }}><Menu size={22} /></button>
        </div>

        <div style={{ flex: 1, padding: "28px 28px 90px" }} className="ec-content-pad">
          {children}
        </div>

        <div className="ec-mobile-bottomnav" style={{ display: "none", position: "fixed", bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.line}`, padding: "8px 6px", justifyContent: "space-around", zIndex: 40 }}>
          {MOBILE_TABS.map((t) => {
            const active = page === t.id;
            return (
              <button key={t.id} onClick={() => setPage(t.id)} className="ec-focus" style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? C.green : C.gray400, padding: "4px 10px" }}>
                <t.icon size={19} />
                <span style={{ fontSize: 10.5, fontWeight: 600 }}>{t.label}</span>
              </button>
            );
          })}
          <button onClick={() => setMobileOpen(true)} className="ec-focus" style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: C.gray400, padding: "4px 10px" }}>
            <Menu size={19} /><span style={{ fontSize: 10.5, fontWeight: 600 }}>Mais</span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div onClick={() => setMobileOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(15,30,24,.5)" }} />
          <div className="ec-fade" style={{ position: "relative", width: 260, background: C.forest, height: "100%", padding: "18px 14px", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, padding: "0 6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Leaf size={16} color={C.greenBright} /><span className="ec-display" style={{ color: "white", fontWeight: 700 }}>EcoCheck</span></div>
              <button onClick={() => setMobileOpen(false)} className="ec-focus" style={{ background: "none", border: "none", color: "white" }}><X size={20} /></button>
            </div>
            {SIDEBAR.map((s) => {
              const active = page === s.id;
              return (
                <div key={s.id} onClick={() => { setPage(s.id); setMobileOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", borderRadius: 9, marginBottom: 2, background: active ? "#1E4636" : "transparent", color: active ? "white" : "#B7C6BC" }}>
                  <s.icon size={16} color={active ? C.greenBright : "#8CA394"} /><span style={{ fontSize: 13.8, fontWeight: 500 }}>{s.label}</span>
                </div>
              );
            })}
            <div onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 11, padding: "11px 12px", borderRadius: 9, marginTop: 6, borderTop: "1px solid #24493B", paddingTop: 16, color: "#B7C6BC", cursor: "pointer" }}>
              <LogOut size={16} color="#8CA394" /><span style={{ fontSize: 13.8, fontWeight: 500 }}>Sair</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .ec-hide-mobile { display: none !important; }
          .ec-mobile-topbar { display: flex !important; }
          .ec-mobile-bottomnav { display: flex !important; }
          .ec-content-pad { padding: 20px 16px 84px !important; }
        }
      `}</style>
    </div>
  );
}

function PageHeader({ title, sub, right }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26, flexWrap: "wrap", gap: 14 }}>
      <div>
        <h1 className="ec-display" style={{ fontSize: 24, fontWeight: 700, color: C.forest, margin: 0 }}>{title}</h1>
        {sub && <div style={{ color: C.gray600, fontSize: 14, marginTop: 6 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ---- Dashboard Home ---- */
function DashboardHome({ goto, currentUser }) {
  const firstName = currentUser?.name?.split(" ")[0] || COMPANY.owner;
  const stats = [
    { n: "3", l: "pendências", tone: "orange" },
    { n: "2", l: "documentos próximos do vencimento", tone: "blue" },
    { n: "1", l: "obrigação próxima", tone: "blue" },
    { n: "0", l: "tarefas atrasadas", tone: "green" },
  ];
  const ultimosDocs = DOCUMENTOS.slice(0, 3);
  return (
    <div>
      <PageHeader title={`Olá, ${firstName}.`} sub="Veja o que precisa da sua atenção." />
      <div style={{ display: "grid", gridTemplateColumns: "290px 1fr", gap: 20, marginBottom: 24 }} className="ec-dash-top">
        <Card style={{ padding: "22px 20px" }}>
          <LevelBadge size="sm" />
        </Card>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }} className="ec-stats-grid">
          {stats.map((s) => (
            <Card key={s.l} style={{ padding: 18 }}>
              <div className="ec-display" style={{ fontSize: 28, fontWeight: 800, color: TONE[s.tone].fg }}>{s.n}</div>
              <div style={{ fontSize: 12.5, color: C.gray600, marginTop: 4, lineHeight: 1.3 }}>{s.l}</div>
            </Card>
          ))}
        </div>
      </div>

      <SectionLabel title="Resolva primeiro" />
      <div style={{ display: "grid", gap: 12, marginBottom: 34 }}>
        {PENDENCIAS.map((p) => (
          <Card key={p.id} style={{ padding: 18, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <AlertTriangle size={18} color={C.orange} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: 14.3 }}>{p.title}</div>
              <div style={{ marginTop: 6 }}><PriorityPill p={p.priority} /></div>
            </div>
            <Btn variant={p.priority === "ALTA" ? "accent" : "secondary"} size="sm" onClick={() => goto("pendencias")}>Ver como resolver</Btn>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="ec-dash-bottom">
        <div>
          <SectionLabel title="Próximos prazos" />
          <Card style={{ padding: 6 }}>
            {PRAZOS.map((p, i) => (
              <div key={p.title} style={{ display: "flex", gap: 14, alignItems: "center", padding: "13px 14px", borderBottom: i < PRAZOS.length - 1 ? `1px solid ${C.line}` : "none" }}>
                <div style={{ width: 48, textAlign: "center", background: C.paperDim, borderRadius: 9, padding: "6px 0", flexShrink: 0 }}>
                  <div className="ec-display" style={{ fontSize: 15, fontWeight: 800, color: C.forest, lineHeight: 1 }}>{p.date}</div>
                  <div className="ec-mono" style={{ fontSize: 9.5, color: C.gray600 }}>{p.month}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.6 }}>{p.title}</div>
                  <div style={{ fontSize: 12.3, color: C.gray600, marginTop: 2 }}>{p.desc}</div>
                </div>
                <Pill tone={CAL_TONE[p.status]}>{p.status}</Pill>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <SectionLabel title="Últimos documentos" />
          <Card style={{ padding: 6 }}>
            {ultimosDocs.map((d, i) => (
              <div key={d.name} onClick={() => goto("documentos")} style={{ cursor: "pointer", display: "flex", gap: 12, alignItems: "center", padding: "13px 14px", borderBottom: i < ultimosDocs.length - 1 ? `1px solid ${C.line}` : "none" }}>
                <FileText size={16} color={C.forest} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</div>
                </div>
                <Pill tone={statusTone(d.status)}>{d.status}</Pill>
              </div>
            ))}
          </Card>
        </div>
      </div>
      <style>{`
        @media (max-width: 900px) { .ec-dash-top { grid-template-columns: 1fr !important; } .ec-dash-bottom { grid-template-columns: 1fr !important; } }
        @media (max-width: 560px) { .ec-stats-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
    </div>
  );
}

/* ---- Pendências page ---- */
function PendenciasPage({ goto }) {
  const [openId, setOpenId] = useState(PENDENCIAS[0].id);
  return (
    <div>
      <PageHeader title="Pendências" sub="Pontos identificados no seu diagnóstico que ainda merecem verificação." />
      <div style={{ display: "grid", gap: 12 }}>
        {PENDENCIAS.map((p) => (
          <Card key={p.id} style={{ padding: 18 }}>
            <div onClick={() => setOpenId(openId === p.id ? null : p.id)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: C.orangeSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <AlertTriangle size={17} color={C.orange} />
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{p.title}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}><PriorityPill p={p.priority} /><Pill tone="gray">{p.area}</Pill></div>
              </div>
              <ChevronDown size={18} color={C.gray400} style={{ transform: openId === p.id ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
            </div>
            {openId === p.id && (
              <div className="ec-fade" style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
                <p style={{ fontSize: 13.6, color: C.gray600, lineHeight: 1.6, marginBottom: 14 }}>{p.detail}</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Btn variant="secondary" size="sm" icon={BookOpen} onClick={() => goto("tutoriais")}>Ver tutorial</Btn>
                  <Btn variant="ghost" size="sm" icon={Calendar} onClick={() => goto("calendario")}>Adicionar prazo</Btn>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---- Documentos page ---- */
function DocumentosPage({ goto }) {
  const [cat, setCat] = useState("Todos");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const filtered = cat === "Todos" ? DOCUMENTOS : DOCUMENTOS.filter((d) => d.categoria === cat);

  const runAnalysis = () => {
    setAnalyzing(true); setAnalyzed(false);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 1500);
  };

  const comPrazo = ANALYSIS_POINTS.filter((p) => p.prazo).length;

  return (
    <div>
      <PageHeader title="Documentos" sub="Todos os seus documentos ambientais, organizados por categoria." right={<Btn icon={Upload} size="sm">Enviar documento</Btn>} />

      <Card style={{ padding: 20, marginBottom: 24, background: C.greenSoft, border: `1px solid ${C.green}33` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Sparkles size={19} color={C.green} />
          </div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: C.forest }}>Analisar com IA</div>
            <div style={{ fontSize: 13, color: C.gray600, marginTop: 2 }}>Envie um documento e entenda em segundos o que ele exige.</div>
          </div>
          <Btn size="sm" onClick={runAnalysis}>{analyzing ? "Analisando…" : "Analisar com IA"}</Btn>
        </div>
        {analyzing && <div className="ec-fade ec-pulse" style={{ marginTop: 14, fontSize: 13, color: C.gray600 }}>Analisando documento…</div>}
        {analyzed && (
          <div className="ec-fade" style={{ marginTop: 16, background: C.white, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, color: C.green, fontWeight: 700, fontSize: 13.5 }}>
              <CheckCircle2 size={16} /> Documento analisado.
            </div>
            <div style={{ fontSize: 13, color: C.gray600, marginBottom: 12 }}>
              Identificamos <strong>{ANALYSIS_POINTS.length} pontos</strong> importantes — {comPrazo} possuem prazo, 1 exige documento adicional e 3 são informações de acompanhamento.
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {ANALYSIS_POINTS.map((pt) => (
                <div key={pt.desc} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px" }}>
                  <CircleDot size={12} color={C.green} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 160, fontSize: 12.8 }}>{pt.desc}</div>
                  {pt.prazo && <Pill tone="blue">{pt.prazo}</Pill>}
                  <PriorityPill p={pt.priority} />
                  {pt.prazo && <Btn variant="ghost" size="sm" icon={Calendar} onClick={() => goto("calendario")}>Adicionar</Btn>}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {DOC_CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} className="ec-chip ec-focus" style={{
            padding: "7px 14px", borderRadius: 999, fontSize: 12.8, fontWeight: 600,
            border: `1.5px solid ${cat === c ? C.green : C.line}`, background: cat === c ? C.greenSoft : C.white, color: cat === c ? C.green : C.gray600,
          }}>{c}</button>
        ))}
      </div>

      <Card style={{ padding: 6 }}>
        {filtered.map((d, i) => (
          <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 14px", borderBottom: i < filtered.length - 1 ? `1px solid ${C.line}` : "none", flexWrap: "wrap" }}>
            <div style={{ width: 38, height: 38, borderRadius: 9, background: C.paperDim, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileText size={17} color={C.forest} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: 13.8 }}>{d.name}</div>
              <div style={{ fontSize: 12, color: C.gray400, marginTop: 3 }}>
                {d.categoria}{d.validade !== "—" && ` · válido até ${d.validade}`}{d.upload !== "—" && ` · enviado em ${d.upload}`}
              </div>
            </div>
            <Pill tone={statusTone(d.status)}>{d.status}</Pill>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ padding: 30, textAlign: "center", color: C.gray400, fontSize: 13.5 }}>Nenhum documento nesta categoria ainda.</div>}
      </Card>
    </div>
  );
}

/* ---- Licenças / Resíduos / Obrigações ---- */
function LicencasPage() {
  const lic = DOCUMENTOS.filter((d) => d.categoria === "Licenças" || d.categoria === "Outorgas");
  return (
    <div>
      <PageHeader title="Licenças" sub="Licenças e outorgas vinculadas à sua empresa." />
      <div style={{ display: "grid", gap: 12 }}>
        {lic.map((d) => (
          <Card key={d.name} style={{ padding: 18, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: TONE[statusTone(d.status)].bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShieldCheck size={19} color={TONE[statusTone(d.status)].fg} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{d.name}</div>
              <div style={{ fontSize: 12.5, color: C.gray600, marginTop: 3 }}>Validade: {d.validade}</div>
            </div>
            <Pill tone={statusTone(d.status)}>{d.status}</Pill>
            <Btn variant="secondary" size="sm">Ver detalhes</Btn>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ResiduosPage() {
  const cats = [
    { n: "Resíduos de construção", status: "Ponto de atenção", tone: "orange" },
    { n: "Recicláveis", status: "Em ordem", tone: "green" },
    { n: "Orgânicos", status: "Em ordem", tone: "green" },
    { n: "Perigosos", status: "Não identificado", tone: "gray" },
  ];
  return (
    <div>
      <PageHeader title="Resíduos" sub="Categorias de resíduos identificadas na sua operação." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }} className="ec-grid-2">
        {cats.map((c) => (
          <Card key={c.n} style={{ padding: 18, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: TONE[c.tone].bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Recycle size={17} color={TONE[c.tone].fg} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13.8 }}>{c.n}</div>
              <div style={{ marginTop: 5 }}><Pill tone={c.tone}>{c.status}</Pill></div>
            </div>
          </Card>
        ))}
      </div>
      <style>{`@media (max-width:640px){.ec-grid-2{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}

function ObrigacoesPage() {
  const items = [...PENDENCIAS.map((p) => ({ title: p.title, tag: p.area, priority: p.priority })), { title: "Renovar outorga do poço", tag: "Recursos Hídricos", priority: "MÉDIA" }];
  return (
    <div>
      <PageHeader title="Obrigações" sub="Tudo que pode precisar de verificação, identificado a partir do seu diagnóstico." />
      <Card style={{ padding: 6 }}>
        {items.map((p, i) => (
          <div key={p.title} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 14px", borderBottom: i < items.length - 1 ? `1px solid ${C.line}` : "none", flexWrap: "wrap" }}>
            <ClipboardList size={17} color={C.forest} />
            <div style={{ flex: 1, minWidth: 200, fontWeight: 700, fontSize: 13.8 }}>{p.title}</div>
            <Pill tone="gray">{p.tag}</Pill>
            <PriorityPill p={p.priority} />
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ---- Calendário ---- */
function CalendarioPage() {
  return (
    <div>
      <PageHeader title="Calendário" sub="Seus próximos prazos, vencimentos, condicionantes e renovações." />
      <div style={{ display: "grid", gap: 10, marginBottom: 22 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", background: C.orangeSoft, borderRadius: 12, padding: "12px 16px" }}>
          <Bell size={16} color={C.orange} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13.3, color: C.orangeDeep, fontWeight: 600 }}>Seu documento vence em 30 dias.</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", background: C.orangeSoft, borderRadius: 12, padding: "12px 16px" }}>
          <AlertTriangle size={16} color={C.orange} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13.3, color: C.orangeDeep, fontWeight: 600 }}>Uma obrigação vence em 7 dias.</span>
        </div>
      </div>
      <Card style={{ padding: 6 }}>
        {PRAZOS.map((p, i) => (
          <div key={p.title} style={{ display: "flex", gap: 16, alignItems: "center", padding: "16px 16px", borderBottom: i < PRAZOS.length - 1 ? `1px solid ${C.line}` : "none", flexWrap: "wrap" }}>
            <div style={{ width: 54, textAlign: "center", background: C.paperDim, borderRadius: 10, padding: "8px 0", flexShrink: 0 }}>
              <div className="ec-display" style={{ fontSize: 18, fontWeight: 800, color: C.forest, lineHeight: 1 }}>{p.date}</div>
              <div className="ec-mono" style={{ fontSize: 10, color: C.gray600 }}>{p.month}</div>
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{p.title}</div>
              <div style={{ fontSize: 12.8, color: C.gray600, marginTop: 3 }}>{p.desc}</div>
            </div>
            <Pill tone={CAL_TONE[p.status]}>{p.status}</Pill>
            <Btn variant="secondary" size="sm">Ver</Btn>
          </div>
        ))}
      </Card>
    </div>
  );
}

/* ---- Tutoriais ---- */
function TutoriaisPage({ goto, setActiveTutorial }) {
  return (
    <div>
      <PageHeader title="Tutoriais" sub="Aprenda o que sua empresa precisa em linguagem simples." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }} className="ec-grid-2">
        {TUTORIAIS.map((t) => (
          <Card key={t.id} style={{ padding: 20, cursor: "pointer" }} onClick={() => { setActiveTutorial(t.id); goto("tutorial-detalhe"); }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.greenSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <t.icon size={19} color={C.green} />
              </div>
              <Pill tone="gray">{t.categoria}</Pill>
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.forest, margin: "14px 0 6px", lineHeight: 1.35 }}>{t.titulo}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.gray600, fontSize: 12.5 }}><PlayCircle size={14} /> {t.tempo}</div>
          </Card>
        ))}
      </div>
      <style>{`@media (max-width:640px){.ec-grid-2{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}

function TutorialDetalhe({ goto }) {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState([]);
  const total = PGRS_STEPS.length;
  const cur = PGRS_STEPS[step];
  const cats = ["Concreto e entulho", "Madeira", "Metal", "Plástico e embalagens", "Solo escavado"];
  const docs = ["MTR", "CDF", "Comprovantes", "Contratos", "Relatórios"];

  return (
    <div>
      <button onClick={() => goto("tutoriais")} className="ec-btn ec-focus" style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, color: C.gray600, cursor: "pointer", fontSize: 13.5, marginBottom: 18 }}>
        <ArrowLeft size={15} /> Voltar aos tutoriais
      </button>
      <Card style={{ padding: 28, maxWidth: 640, margin: "0 auto" }}>
        <div className="ec-display" style={{ fontSize: 13.5, fontWeight: 700, color: C.forest, marginBottom: 4 }}>PGRS — passo a passo</div>
        <div className="ec-mono" style={{ fontSize: 12, color: C.green, fontWeight: 600, marginBottom: 8 }}>
          {step < total - 1 ? `${step + 1} de ${total} etapas` : "Concluído"}
        </div>
        <div style={{ height: 6, background: C.paperDim, borderRadius: 999, overflow: "hidden", marginBottom: 26 }}>
          <div style={{ height: "100%", width: `${((step + 1) / total) * 100}%`, background: C.greenBright, transition: "width .4s ease" }} />
        </div>

        <div key={step} className="ec-fade">
          {cur.type === "done" ? (
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ display: "inline-flex", padding: 18, borderRadius: 999, background: C.greenSoft, marginBottom: 16 }}><CheckCircle2 size={30} color={C.green} /></div>
              <h3 className="ec-display" style={{ fontSize: 21, fontWeight: 700, color: C.forest, marginBottom: 10 }}>Você concluiu este tutorial.</h3>
              <p style={{ color: C.gray600, fontSize: 14, lineHeight: 1.6 }}>{cur.body}</p>
            </div>
          ) : (
            <>
              <h3 className="ec-display" style={{ fontSize: 21, fontWeight: 700, color: C.forest, marginBottom: 12 }}>{cur.title}</h3>
              <p style={{ color: C.gray600, fontSize: 14.5, lineHeight: 1.65, marginBottom: 18 }}>{cur.body}</p>
              {step === 0 && (
                <div style={{ background: C.paperDim, borderRadius: 12, height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: C.gray400, gap: 8 }}>
                  <PlayCircle size={22} /> <span style={{ fontSize: 13 }}>Vídeo explicativo (placeholder)</span>
                </div>
              )}
              {cur.type === "select" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                  {cats.map((c) => {
                    const on = sel.includes(c);
                    return (
                      <button key={c} onClick={() => setSel((p) => on ? p.filter((x) => x !== c) : [...p, c])} className="ec-chip ec-focus" style={{
                        padding: "9px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                        border: `1.5px solid ${on ? C.green : C.line}`, background: on ? C.greenSoft : C.white, color: on ? C.green : C.ink,
                      }}>{c}</button>
                    );
                  })}
                </div>
              )}
              {step === 2 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 4 }}>
                  {["Coberto", "Identificado", "Separado por tipo"].map((l) => (
                    <div key={l} style={{ background: C.paperDim, borderRadius: 10, padding: "16px 8px", textAlign: "center" }}>
                      <FolderOpen size={18} color={C.green} style={{ marginBottom: 6 }} />
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: C.forest }}>{l}</div>
                    </div>
                  ))}
                </div>
              )}
              {cur.type === "docs" && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>
                  {docs.map((d) => (
                    <div key={d} style={{ display: "flex", alignItems: "center", gap: 7, background: C.paperDim, borderRadius: 9, padding: "9px 14px" }}>
                      <FileText size={14} color={C.green} /><span style={{ fontSize: 13, fontWeight: 600 }}>{d}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30 }}>
          <Btn variant="ghost" onClick={() => step > 0 ? setStep(step - 1) : goto("tutoriais")}>{step > 0 ? "Etapa anterior" : "Sair"}</Btn>
          {cur.type === "done" ? (
            <Btn icon={ArrowRight} onClick={() => goto("documentos")}>Ir para documentos</Btn>
          ) : (
            <Btn icon={ArrowRight} onClick={() => setStep(step + 1)}>Próxima etapa</Btn>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ---- Assistente IA ---- */
function AssistentePage({ goto }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Posso ajudar você a entender seus documentos, obrigações e próximos passos." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  const suggestions = [
    "O que significa minha licença?",
    "Quais documentos estão faltando?",
    "Tenho um poço. O que preciso verificar?",
    "Explique minha condicionante.",
    "Quais obrigações tenho este mês?",
  ];

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages, typing]);

  const reply = (userText) => {
    const t = userText.toLowerCase();
    if (t.includes("licença") || t.includes("licenca") || t.includes("condicionante")) {
      return {
        text: "Identifiquei 3 pontos relacionados à sua licença. Um documento está próximo do vencimento. Duas condicionantes precisam ser acompanhadas.",
        actions: [
          { label: "Ver licença", to: "licencas" },
          { label: "Ver condicionantes", to: "licencas" },
          { label: "Adicionar prazo", to: "calendario" },
        ],
      };
    }
    if (t.includes("poço") || t.includes("poco")) {
      return {
        text: "Você informou que usa um poço, mas não há outorga cadastrada. Com base nisso, pode ser necessário regularizar o uso da água junto ao órgão gestor.",
        actions: [{ label: "Ver tutorial", to: "tutoriais" }, { label: "Adicionar prazo", to: "calendario" }],
      };
    }
    if (t.includes("falt") || t.includes("document")) {
      return {
        text: "Identificamos 3 documentos que ainda não foram enviados: PGRS, CDF e Laudo de ruído.",
        actions: [{ label: "Ver documentos", to: "documentos" }],
      };
    }
    if (t.includes("obrigaç") || t.includes("obrigac") || t.includes("mês") || t.includes("mes")) {
      return {
        text: "Este mês, sua empresa tem 2 pontos que podem exigir acompanhamento: um documento e uma condicionante ambiental.",
        actions: [{ label: "Ver calendário", to: "calendario" }],
      };
    }
    return {
      text: "Entendido. Com base no seu diagnóstico, isso está relacionado às suas pendências de licenciamento e resíduos. Posso te mostrar onde acompanhar isso.",
      actions: [{ label: "Ver pendências", to: "pendencias" }],
    };
  };

  const send = (text) => {
    const val = (text ?? input).trim();
    if (!val) return;
    setMessages((m) => [...m, { role: "user", text: val }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { role: "ai", ...reply(val) }]);
    }, 1100);
  };

  return (
    <div>
      <PageHeader title="Assistente EcoCheck" sub="Tire dúvidas sobre suas obrigações a qualquer hora." />
      <Card style={{ display: "flex", flexDirection: "column", height: "62vh", maxWidth: 720, margin: "0 auto" }}>
        <div ref={scrollRef} className="ec-scroll" style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.map((m, i) => (
            <div key={i} className="ec-fade" style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "82%", padding: "11px 15px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background: m.role === "user" ? C.forest : C.paperDim, color: m.role === "user" ? "white" : C.ink, fontSize: 13.8, lineHeight: 1.55,
              }}>
                {m.text}
              </div>
              {m.actions && (
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 8, maxWidth: "90%" }}>
                  {m.actions.map((act) => (
                    <button key={act.label} onClick={() => goto(act.to)} className="ec-chip ec-focus" style={{ fontSize: 12.3, padding: "7px 12px", borderRadius: 999, border: `1.5px solid ${C.green}`, background: C.white, color: C.green, fontWeight: 600 }}>{act.label}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {typing && (
            <div className="ec-fade" style={{ alignSelf: "flex-start", background: C.paperDim, borderRadius: "14px 14px 14px 4px", padding: "11px 16px" }}>
              <span className="ec-pulse" style={{ fontSize: 13, color: C.gray600 }}>digitando…</span>
            </div>
          )}
        </div>
        {messages.length < 2 && (
          <div style={{ padding: "0 16px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} className="ec-chip ec-focus" style={{ fontSize: 12.3, padding: "7px 12px", borderRadius: 999, border: `1.5px solid ${C.line}`, background: C.white, color: C.forest, fontWeight: 500 }}>{s}</button>
            ))}
          </div>
        )}
        <div style={{ borderTop: `1px solid ${C.line}`, padding: 12, display: "flex", gap: 8 }}>
          <input className="ec-input" placeholder="Escreva sua pergunta…" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
          <Btn onClick={() => send()} icon={Send}>Enviar</Btn>
        </div>
      </Card>
    </div>
  );
}

/* ---- Planos / Configurações ---- */
function PlanosPage({ goto }) {
  return (
    <div>
      <PageHeader title="Planos" sub="O diagnóstico inicial é gratuito. Faça upgrade quando quiser mais controle." />
      <PlansGrid goto={goto} />
    </div>
  );
}

function ConfiguracoesPage({ currentUser }) {
  return (
    <div>
      <PageHeader title="Configurações" sub="Dados da empresa e preferências da conta." />
      <Card style={{ padding: 24, maxWidth: 560 }}>
        <div style={{ display: "grid", gap: 14 }}>
          <Field label="Razão social"><input className="ec-input" defaultValue={currentUser?.company || COMPANY.razaoSocial} /></Field>
          <Field label="CNPJ"><input className="ec-input ec-mono" defaultValue={COMPANY.cnpj} /></Field>
          <Field label="Responsável"><input className="ec-input" defaultValue={currentUser?.name || COMPANY.owner} /></Field>
          <Field label="E-mail para alertas"><input className="ec-input" defaultValue={currentUser?.email || "joao@construtorabarbosa.com.br"} /></Field>
        </div>
        <div style={{ marginTop: 8 }}><Btn>Salvar alterações</Btn></div>
      </Card>
    </div>
  );
}
/* ============================== ONBOARDING ============================== */
const LOADING_MESSAGES = [
  "Analisando suas respostas…", 
  "Organizando os pontos que precisam de atenção…", 
  "Seu diagnóstico está pronto."
];

function Onboarding({ goto }) {
  const [stage, setStage] = useState(1);
  const [a, setA] = useState({
    cnpj: COMPANY.cnpj, razaoSocial: COMPANY.razaoSocial, nomeFantasia: COMPANY.nomeFantasia,
    estado: COMPANY.estado, municipio: COMPANY.municipio, atividade: COMPANY.atividade,
    porte: COMPANY.porte, area: COMPANY.area, funcionarios: COMPANY.funcionarios,
    usaAgua: "", origemAgua: "", outorga: "",
    geraResiduos: "", categoriasResiduos: [],
    efluentes: "",
    licenca: "", numLicenca: "", orgao: "", dataEmissao: "", dataValidade: "", condicionantes: "",
    quimicos: "", emissoes: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const totalStages = 7;

  const set = (k, v) => setA((p) => ({ ...p, [k]: v }));
  const toggleArr = (k, v) => setA((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));

  const next = () => (stage < totalStages ? setStage(stage + 1) : submit());
  const back = () => (stage > 1 ? setStage(stage - 1) : goto("landing"));

  const submit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gerar-diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(a)
      });
      const data = await response.json();
      if (data.success && data.diagnostico) {
        window.resultadoDiagnosticoIA = data.diagnostico;
      }
    } catch (err) {
      console.error("Erro na requisição da IA:", err);
    }
  };

  useEffect(() => {
    if (!loading) return;
    const t1 = setTimeout(() => setLoadingStep(1), 1000);
    const t2 = setTimeout(() => setLoadingStep(2), 2000);
    const t3 = setTimeout(() => goto("resultado"), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [loading, goto]);

  const canAdvance = useMemo(() => {
    if (stage === 1) return a.cnpj && a.razaoSocial && a.atividade;
    return true;
  }, [stage, a]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.paper, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Card style={{ padding: 40, textAlign: "center", maxWidth: 420, width: "100%" }}>
          <Loader2 size={36} color={C.green} className="ec-spin" style={{ margin: "0 auto 20px" }} />
          <h3 className="ec-display" style={{ fontSize: 18, color: C.forest, marginBottom: 8 }}>Gerando Diagnóstico</h3>
          <p style={{ fontSize: 14, color: C.gray600 }}>{LOADING_MESSAGES[loadingStep]}</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.paper, padding: "40px 24px" }}>
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Btn variant="ghost" size="sm" icon={ArrowLeft} onClick={back}>Voltar</Btn>
          <span style={{ fontSize: 13, color: C.gray600 }}>Etapa {stage} de {totalStages}</span>
        </div>
        <Card style={{ padding: 32 }}>
          <h2 className="ec-display" style={{ fontSize: 22, color: C.forest, marginBottom: 20 }}>
            {stage === 1 && "Dados da Empresa"}
            {stage === 2 && "Recursos Hídricos"}
            {stage === 3 && "Gestão de Resíduos"}
            {stage === 4 && "Efluentes Líquidos"}
            {stage === 5 && "Licenciamento Ambiental"}
            {stage === 6 && "Produtos Químicos"}
            {stage === 7 && "Emissões Atmosféricas"}
          </h2>
          
          {stage === 1 && (
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>CNPJ</label>
                <input className="ec-input" value={a.cnpj} onChange={(e) => set("cnpj", e.target.value)} placeholder="00.000.000/0000-00" />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Razão Social</label>
                <input className="ec-input" value={a.razaoSocial} onChange={(e) => set("razaoSocial", e.target.value)} placeholder="Nome da empresa" />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Atividade Principal</label>
                <input className="ec-input" value={a.atividade} onChange={(e) => set("atividade", e.target.value)} placeholder="Ex: Construção civil" />
              </div>
            </div>
          )}

          {stage > 1 && (
            <div style={{ padding: "20px 0", color: C.gray600, fontSize: 14 }}>
              Preencha os dados desta etapa para avançar na análise ambiental.
            </div>
          )}

          <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
            <Btn onClick={next} icon={ArrowRight} style={{ opacity: canAdvance ? 1 : 0.5 }}>
              {stage === totalStages ? "Gerar Diagnóstico" : "Avançar"}
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("landing");

  return (
    <div className="ec-root" style={{ background: C.paper, minHeight: "100vh" }}>
      <style>{FONTS}</style>
      {view === "landing" && <Landing goto={(v) => setView(v)} />}
      {view === "onboarding" && <Onboarding goto={(v) => setView(v)} />}
    </div>
  );
}
