import { useState, useEffect, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface NavItem { label: string; href: string }
interface Feature { icon: string; title: string; desc: string; accent: string }
interface Step { num: string; title: string; desc: string }
interface Stat { value: string; label: string; suffix?: string }
interface AgentCard { name: string; role: string; icon: string; color: string }
interface Testimonial { quote: string; name: string; role: string; company: string }

// ─── Data ────────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Agents", href: "#agents" },
  { label: "Testimonials", href: "#testimonials" },
];

const FEATURES: Feature[] = [
  {
    icon: "🧠",
    title: "Multi-Agent Orchestration",
    desc: "Autonomous agent graph coordinates research, retrieval, memory, tool use, and verification all in a single query lifecycle.",
    accent: "#00BAF2",
  },
  {
    icon: "📄",
    title: "PDF Intelligence",
    desc: "Upload PDFs and let Astraeus extract, chunk, embed, and store ready to answer questions instantly with source attribution.",
    accent: "#002970",
  },
  {
    icon: "🔍",
    title: "Semantic Retrieval",
    desc: "ChromaDB-powered vector search surfaces the most contextually relevant chunks, not just keyword matches.",
    accent: "#00BAF2",
  },
  {
    icon: "✅",
    title: "Answer Verification",
    desc: "A dedicated verification agent cross-checks every answer for factual grounding before it reaches you.",
    accent: "#002970",
  },
  {
    icon: "🧩",
    title: "Session Memory",
    desc: "Redis-backed conversation memory maintains context across turns your assistant remembers what you told it.",
    accent: "#00BAF2",
  },
  {
    icon: "🔧",
    title: "Tool-Augmented Reasoning",
    desc: "Tool agents extend capabilities beyond documents web lookups, calculations, external API calls on demand.",
    accent: "#002970",
  },
];

const STEPS: Step[] = [
  { num: "01", title: "Upload your documents", desc: "Drop in PDFs. Astraeus extracts text, splits into semantic chunks, and generates embeddings automatically." },
  { num: "02", title: "Ask anything naturally", desc: "Type your question in plain language. The orchestrator dispatches the right agents to handle your query." },
  { num: "03", title: "Get verified answers", desc: "Receive precise, source-grounded answers with retrieved context and verification status included." },
];

const STATS: Stat[] = [
  { value: "5", label: "Specialized Agents", suffix: "+" },
  { value: "99", label: "Accuracy Verified", suffix: "%" },
  { value: "10x", label: "Faster than manual review" },
  { value: "∞", label: "Documents supported" },
];

const AGENTS: AgentCard[] = [
  { name: "Orchestrator", role: "Coordinates the entire agent graph and routes queries optimally.", icon: "🎯", color: "#002970" },
  { name: "Research Agent", role: "Investigates complex topics using external resources and reasoning.", icon: "🔬", color: "#00BAF2" },
  { name: "Retrieval Agent", role: "Performs semantic search across your uploaded document corpus.", icon: "📡", color: "#002970" },
  { name: "Memory Agent", role: "Maintains session context across multi-turn conversations via Redis.", icon: "💾", color: "#00BAF2" },
  { name: "Tool Agent", role: "Executes external tools, APIs, and calculations on demand.", icon: "🔧", color: "#002970" },
  { name: "Verification Agent", role: "Validates every answer for factual accuracy before delivery.", icon: "✅", color: "#00BAF2" },
];

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "We replaced three manual research workflows with Astraeus. Our analysts spend zero time digging through PDFs now.",
    name: "Priya Mehta",
    role: "Head of Research",
    company: "Axiom Capital",
  },
  {
    quote: "The multi-agent architecture is impressive. The verification layer alone justifies the switch no more hallucinated answers.",
    name: "Rohan Sinha",
    role: "CTO",
    company: "LegalStack AI",
  },
  {
    quote: "Session memory makes it feel like talking to a colleague who remembers everything. It's genuinely transformative.",
    name: "Anjali Kapoor",
    role: "Product Lead",
    company: "DocuFlow",
  },
];

// ─── Hooks ───────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
        boxShadow: scrolled ? "0 2px 24px rgba(0,41,112,0.10)" : "none",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-sm transition-transform group-hover:scale-110"
            style={{ background: "linear-gradient(135deg,#002970,#00BAF2)" }}
          >
            A
          </div>
          <span
            className="font-black text-xl tracking-tight transition-colors"
            style={{ color: scrolled ? "#002970" : "#fff" }}
          >
            ASTRAEUS
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="text-sm font-semibold transition-colors hover:opacity-70"
              style={{ color: scrolled ? "#002970" : "#fff" }}
            >
              {n.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#"
            className="text-sm font-bold px-4 py-2 rounded-lg transition-all hover:opacity-80"
            style={{ color: scrolled ? "#002970" : "#fff" }}
          >
            Sign In
          </a>
          <a
            href="#"
            className="text-sm font-bold px-5 py-2 rounded-lg transition-all hover:scale-105 active:scale-95"
            style={{
              background: scrolled ? "#002970" : "#fff",
              color: scrolled ? "#fff" : "#002970",
            }}
          >
            Get Started Free
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          style={{ color: scrolled ? "#002970" : "#fff" }}
        >
          <div className="w-5 flex flex-col gap-1">
            <span className={`block h-0.5 w-full bg-current transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
            <span className={`block h-0.5 w-full bg-current transition-all ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-full bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {NAV_ITEMS.map((n) => (
            <a
              key={n.label}
              href={n.href}
              className="text-sm font-semibold text-[#002970] hover:opacity-70"
              onClick={() => setMenuOpen(false)}
            >
              {n.label}
            </a>
          ))}
          <a
            href="#"
            className="text-sm font-bold px-5 py-2 rounded-lg text-center text-white"
            style={{ background: "#002970" }}
          >
            Get Started Free
          </a>
        </div>
      )}
    </nav>
  );
}

function HeroSection() {
  const [typed, setTyped] = useState("");
  const queries = [
    "Summarize the Carnot Report's key findings...",
    "What are the main recommendations in section 3?",
    "Compare findings across uploaded documents...",
    "Verify the claim on page 12 of the report...",
  ];
  const [qi, setQi] = useState(0);

  useEffect(() => {
    let i = 0;
    let dir = 1;
    const target = queries[qi];
    const id = setInterval(() => {
      if (dir === 1) {
        i++;
        setTyped(target.slice(0, i));
        if (i >= target.length) { dir = -1; setTimeout(() => {}, 1200); }
      } else {
        i--;
        setTyped(target.slice(0, i));
        if (i <= 0) {
          dir = 1;
          setQi((q) => (q + 1) % queries.length);
          clearInterval(id);
        }
      }
    }, dir === 1 ? 55 : 28);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi]);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16"
      style={{ background: "linear-gradient(160deg,#002970 0%,#004ab3 45%,#00BAF2 100%)" }}
    >
      {/* Decorative circles */}
      <div
        className="absolute top-[-120px] right-[-120px] w-[480px] h-[480px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle,#fff,transparent)" }}
      />
      <div
        className="absolute bottom-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle,#00BAF2,transparent)" }}
      />

      {/* Grid dots overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: "radial-gradient(circle,#fff 1px,transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-white/20 bg-white/10 text-white backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#00BAF2] animate-pulse" />
          AI-Powered RAG Platform
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6 tracking-tight">
          Ask Anything.<br />
          <span
            className="inline-block"
            style={{
              background: "linear-gradient(90deg,#fff,#00BAF2)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Get Verified.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
          Astraeus turns your documents into an intelligent knowledge base powered by a multi-agent AI architecture with built-in answer verification.
        </p>

        {/* Fake search bar */}
        <div className="max-w-2xl mx-auto mb-10">
          <div
            className="flex items-center gap-4 px-5 py-4 rounded-2xl text-left"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1.5px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(16px)",
            }}
          >
            <span className="text-2xl">💬</span>
            <span className="text-white/80 flex-1 text-sm md:text-base font-medium min-h-[24px]">
              {typed}
              <span className="animate-pulse text-[#00BAF2]">|</span>
            </span>
            <button
              className="shrink-0 px-5 py-2 rounded-xl font-bold text-sm text-[#002970] transition-all hover:scale-105 active:scale-95"
              style={{ background: "#fff" }}
            >
              Ask →
            </button>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#"
            className="px-8 py-3.5 rounded-xl font-black text-base text-[#002970] transition-all hover:scale-105 active:scale-95 shadow-2xl"
            style={{ background: "#fff" }}
          >
            Start for Free
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-3.5 rounded-xl font-bold text-base text-white transition-all hover:bg-white/10 border border-white/25"
          >
            See How It Works ↓
          </a>
        </div>

        {/* Floating stats row */}
        <div className="flex flex-wrap justify-center gap-6 mt-16">
          {[
            { icon: "🤖", text: "6 AI Agents" },
            { icon: "🔒", text: "Verified Answers" },
            { icon: "⚡", text: "Real-time Retrieval" },
            { icon: "🧠", text: "Session Memory" },
          ].map((b) => (
            <div
              key={b.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <span>{b.icon}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 80L1440 80L1440 30C1200 80 960 0 720 30C480 60 240 0 0 30L0 80Z" fill="#F7F9FC" />
        </svg>
      </div>
    </section>
  );
}

function StatsSection() {
  const { ref, visible } = useInView();
  return (
    <section ref={ref} className="py-16 bg-[#F7F9FC]">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="text-center transition-all duration-700"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(24px)",
              transitionDelay: `${i * 80}ms`,
            }}
          >
            <div className="text-4xl md:text-5xl font-black text-[#002970]">
              {s.value}<span className="text-[#00BAF2]">{s.suffix}</span>
            </div>
            <div className="text-sm font-semibold text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  const { ref, visible } = useInView();
  return (
    <section id="features" ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="text-center mb-16 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-[#00BAF2] bg-blue-50 mb-4">
            Platform Capabilities
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#002970] leading-tight">
            Everything your team needs<br />to unlock document intelligence.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="group p-7 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-500 cursor-pointer"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(32px)",
                transitionDelay: `${i * 80}ms`,
                background: "#fff",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 transition-transform group-hover:scale-110"
                style={{ background: `${f.accent}15` }}
              >
                {f.icon}
              </div>
              <h3 className="font-black text-lg text-[#002970] mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              <div
                className="mt-4 h-0.5 w-0 group-hover:w-12 transition-all duration-300 rounded-full"
                style={{ background: f.accent }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const { ref, visible } = useInView();
  return (
    <section
      id="how-it-works"
      ref={ref}
      className="py-24"
      style={{ background: "linear-gradient(160deg,#002970 0%,#004ab3 100%)" }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div
          className="text-center mb-16 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-[#00BAF2] bg-white/10 mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Three steps to<br />intelligent answers.
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-0">
          {STEPS.map((s, i) => (
            <div
              key={s.num}
              className="flex-1 relative transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(32px)",
                transitionDelay: `${i * 120}ms`,
              }}
            >
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-white/20" />
              )}

              <div className="flex flex-col items-center text-center px-6 pb-8 md:pb-0">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl mb-5 relative z-10"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.25)", color: "#00BAF2" }}
                >
                  {s.num}
                </div>
                <h3 className="font-black text-lg text-white mb-2">{s.title}</h3>
                <p className="text-sm text-blue-200 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentsSection() {
  const { ref, visible } = useInView();
  return (
    <section id="agents" ref={ref} className="py-24 bg-[#F7F9FC]">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="text-center mb-16 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-[#00BAF2] bg-blue-50 mb-4">
            Agent Architecture
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-[#002970] leading-tight">
            Six specialized agents.<br />One seamless answer.
          </h2>
          <p className="text-gray-500 mt-4 text-lg max-w-xl mx-auto">
            Every query is handled by a coordinated team of AI agents, each expert in their domain.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {AGENTS.map((a, i) => (
            <div
              key={a.name}
              className="group p-6 rounded-2xl bg-white border border-gray-100 hover:shadow-xl transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(32px)",
                transitionDelay: `${i * 80}ms`,
              }}
            >
              <div className="flex items-center gap-4 mb-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-transform group-hover:scale-110"
                  style={{ background: `${a.color}15` }}
                >
                  {a.icon}
                </div>
                <div>
                  <div className="font-black text-[#002970] text-sm">{a.name}</div>
                  <div
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: a.color }}
                  >
                    Agent
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{a.role}</p>
            </div>
          ))}
        </div>

        {/* Architecture diagram hint */}
        <div
          className="mt-12 p-6 rounded-2xl text-center transition-all duration-700"
          style={{
            background: "linear-gradient(135deg,#002970,#004ab3)",
            opacity: visible ? 1 : 0,
            transitionDelay: "500ms",
          }}
        >
          <div className="flex flex-wrap items-center justify-center gap-3 text-white text-sm font-semibold">
            <span>🎯 Orchestrator</span>
            <span className="text-[#00BAF2]">→</span>
            <span>🔬 Research</span>
            <span className="text-[#00BAF2]">+</span>
            <span>📡 Retrieval</span>
            <span className="text-[#00BAF2]">+</span>
            <span>💾 Memory</span>
            <span className="text-[#00BAF2]">+</span>
            <span>🔧 Tool</span>
            <span className="text-[#00BAF2]">→</span>
            <span>✅ Verify</span>
            <span className="text-[#00BAF2]">→</span>
            <span className="px-3 py-1 rounded-full bg-[#00BAF2] text-[#002970] font-black">Answer</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const { ref, visible } = useInView();
  return (
    <section id="testimonials" ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div
          className="text-center mb-16 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-[#00BAF2] bg-blue-50 mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl font-black text-[#002970]">Loved by knowledge teams.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="p-7 rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(32px)",
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <div className="text-[#00BAF2] text-4xl font-black mb-4">"</div>
              <p className="text-gray-700 text-sm leading-relaxed mb-6">{t.quote}</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm"
                  style={{ background: "linear-gradient(135deg,#002970,#00BAF2)" }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-black text-[#002970] text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400 font-medium">{t.role} · {t.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { ref, visible } = useInView();
  return (
    <section
      ref={ref}
      className="py-24"
      style={{ background: "linear-gradient(160deg,#002970 0%,#00BAF2 100%)" }}
    >
      <div
        className="max-w-3xl mx-auto px-6 text-center transition-all duration-700"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)" }}
      >
        <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
          Ready to unlock your documents?
        </h2>
        <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
          Join teams who've stopped searching and started knowing. No setup fees, no configuration headaches.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#"
            className="px-10 py-4 rounded-xl font-black text-[#002970] text-base transition-all hover:scale-105 active:scale-95 shadow-2xl"
            style={{ background: "#fff" }}
          >
            Get Started It's Free
          </a>
          <a
            href="#"
            className="px-10 py-4 rounded-xl font-bold text-white text-base border border-white/30 hover:bg-white/10 transition-all"
          >
            Request a Demo
          </a>
        </div>
        <p className="text-blue-200 text-sm mt-6">No credit card required · Free forever plan available</p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[#001845] text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-white text-xs"
                style={{ background: "linear-gradient(135deg,#002970,#00BAF2)" }}
              >
                A
              </div>
              <span className="font-black text-lg tracking-tight">ASTRAEUS</span>
            </div>
            <p className="text-blue-300 text-sm max-w-xs leading-relaxed">
              Multi-agent RAG platform for intelligent document understanding and verified AI answers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="font-black text-blue-200 mb-3 uppercase tracking-widest text-xs">Product</div>
              {["Features", "How It Works", "Agents", "API Docs"].map((l) => (
                <a key={l} href="#" className="block text-blue-400 hover:text-white transition-colors mb-2">{l}</a>
              ))}
            </div>
            <div>
              <div className="font-black text-blue-200 mb-3 uppercase tracking-widest text-xs">Company</div>
              {["About", "Blog", "Careers", "Contact"].map((l) => (
                <a key={l} href="#" className="block text-blue-400 hover:text-white transition-colors mb-2">{l}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-blue-400 gap-2">
          <span>© 2025 Astraeus. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="font-sans antialiased">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <AgentsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}