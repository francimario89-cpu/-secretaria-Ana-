
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";

// --- Funções Auxiliares ---
const getChatHistory = (messages: any[]) => {
  return messages.slice(-6).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));
};

const askAna = async (message: string, history: any[]) => {
  const apiKey = window.process?.env?.API_KEY || (window as any).RENDER_ENV?.API_KEY;
  if (!apiKey) return { reply: "⚠️ Chave API não encontrada. Verifique as configurações do Render." };

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";

    const systemInstruction = `
      Você é a "Ana", a secretária financeira pessoal do Francimário.
      Sua missão: organizar gastos, lembrar de contas e dar dicas financeiras.
      Estilo: WhatsApp, amigável, usa emojis (💰, ✅, 📉).
      Data de hoje: ${new Date().toLocaleDateString('pt-BR')}.
      Responda sempre em JSON com o campo "reply".
    `;

    const result = await ai.models.generateContent({
      model,
      contents: [
        ...getChatHistory(history),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: { 
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { reply: { type: Type.STRING } },
          required: ["reply"]
        }
      }
    });

    const data = JSON.parse(result.text || '{"reply": "Anotado!"}');
    return data;
  } catch (err) {
    console.error(err);
    return { reply: "Tive um pequeno erro técnico, mas pode continuar falando que eu dou um jeito! 😊" };
  }
};

// --- Componentes ---

const Sidebar = () => {
  const loc = useLocation();
  const menu = [
    { path: '/', icon: 'fa-house', label: 'Início' },
    { path: '/chat', icon: 'fa-comment-dots', label: 'Falar com Ana' },
    { path: '/stats', icon: 'fa-chart-pie', label: 'Estatísticas' }
  ];

  return (
    <div className="hidden md:flex w-64 bg-slate-900 h-screen flex-col border-r border-slate-800">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <i className="fas fa-gem text-white"></i>
        </div>
        <span className="font-bold text-xl text-white">Financia<span className="text-emerald-400">AI</span></span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menu.map(item => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${loc.pathname === item.path ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-2xl p-4 flex items-center gap-3">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" className="w-10 h-10 rounded-full border border-emerald-400 bg-slate-700" />
          <div>
            <p className="text-white text-xs font-bold">Ana Secretária</p>
            <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Ativa</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => (
  <div className="p-6 md:p-12 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
    <header>
      <h1 className="text-3xl font-black text-slate-900 tracking-tight">Olá, Francimário! 👋</h1>
      <p className="text-slate-500 font-medium italic">"O segredo da riqueza é a organização."</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Balanço Atual</p>
        <h3 className="text-3xl font-black text-slate-900">R$ 4.500,00</h3>
        <span className="text-emerald-500 text-xs font-bold mt-2 inline-block">+R$ 200 hoje</span>
      </div>
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Despesas Previstas</p>
        <h3 className="text-3xl font-black text-rose-500">R$ 890,00</h3>
        <span className="text-slate-400 text-xs mt-2 inline-block">3 contas vencendo</span>
      </div>
      <Link to="/chat" className="bg-emerald-600 p-6 rounded-[2rem] text-white shadow-xl shadow-emerald-600/20 hover:scale-[1.02] transition-transform">
        <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-2">Ação Rápida</p>
        <h3 className="text-xl font-bold leading-tight">Clique aqui para falar com a Ana e registrar gastos.</h3>
      </Link>
    </div>

    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 font-bold text-slate-800">Atividade Recente</div>
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Aluguel (Lembrete)</span>
                <span className="text-rose-500 font-black">- R$ 1.200</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Venda de Serviço</span>
                <span className="text-emerald-500 font-black">+ R$ 3.500</span>
            </div>
        </div>
    </div>
  </div>
);

const Chat = () => {
  const [messages, setMessages] = useState<any[]>(() => {
    const saved = localStorage.getItem('ana_chat_v4');
    return saved ? JSON.parse(saved) : [{ 
      id: '1', role: 'assistant', content: 'Oi Francimário! Sou a Ana. O que vamos organizar hoje? 💰', time: 'Agora' 
    }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('ana_chat_v4', JSON.stringify(messages));
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { id: Date.now().toString(), role: 'user', content: input, time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const result = await askAna(input, messages);
    setMessages(prev => [...prev, {
      id: 'ana-' + Date.now(),
      role: 'assistant',
      content: result.reply,
      time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#075e54] text-white p-4 flex items-center gap-4 shrink-0">
        <Link to="/" className="md:hidden"><i className="fas fa-arrow-left"></i></Link>
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" className="w-10 h-10 rounded-full bg-emerald-100" />
        <div>
          <h2 className="font-bold text-sm">Ana Secretária</h2>
          <p className="text-[10px] uppercase font-black opacity-70">Online</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto whatsapp-bg p-4 space-y-4 custom-scrollbar">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
              <p className="text-sm text-slate-800 leading-relaxed">{m.content}</p>
              <span className="block text-[9px] text-slate-400 text-right mt-1 font-bold">{m.time}</span>
            </div>
          </div>
        ))}
        {loading && <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold text-emerald-600 animate-pulse w-fit shadow-sm">Ana está pensando...</div>}
      </div>

      <div className="p-3 bg-[#f0f2f5] flex items-center gap-2 border-t shrink-0">
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Digite sua mensagem..."
          className="flex-1 bg-white p-3 rounded-full outline-none text-sm border focus:border-emerald-500 transition-all"
        />
        <button onClick={handleSend} className="w-12 h-12 bg-[#00a884] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/stats" element={<div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest">Estatísticas em breve...</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
