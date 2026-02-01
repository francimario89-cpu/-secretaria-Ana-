
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ChatMessage } from './types.ts';
import { processMessageWithGemini } from './services/geminiService.ts';

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { path: '/', icon: 'fa-chart-pie', label: 'Dashboard' },
    { path: '/chat', icon: 'fa-whatsapp', label: 'Ana (WhatsApp)' },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen text-white flex flex-col fixed left-0 top-0 z-50 hidden lg:flex border-r border-slate-800">
      <div className="p-8 border-b border-slate-800">
        <h1 className="font-black text-2xl italic">FIN<span className="text-emerald-400">AI</span></h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest">Francimário</p>
      </div>
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
              location.pathname === item.path ? 'bg-emerald-500 text-slate-900 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-6">
        <div className="bg-slate-800 p-4 rounded-2xl text-center">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" className="w-12 h-12 mx-auto rounded-full bg-slate-700 mb-2" alt="Ana" />
          <p className="text-xs font-bold text-emerald-400">Ana está online</p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => (
  <div className="p-6 lg:p-12 max-w-5xl mx-auto">
    <header className="mb-10">
      <h2 className="text-4xl font-black text-slate-900">Olá, Francimário! 👋</h2>
      <p className="text-slate-500 mt-1">Sua secretária financeira já organizou tudo por aqui.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <p className="text-slate-400 text-xs font-bold uppercase mb-1">Saldo Total</p>
        <p className="text-4xl font-black text-slate-900">R$ 4.250,00</p>
      </div>
      <div className="bg-emerald-500 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
        <p className="text-emerald-100 text-xs font-bold uppercase mb-1">Status da Ana</p>
        <p className="text-xl font-bold">"Tudo certinho! Pronto para anotar novos gastos."</p>
        <i className="fab fa-whatsapp absolute -bottom-4 -right-4 text-7xl text-white/10 rotate-12 group-hover:scale-110 transition-all"></i>
      </div>
    </div>

    <Link to="/chat" className="block bg-white border-2 border-dashed border-slate-200 p-10 rounded-[2.5rem] text-center hover:border-emerald-300 transition-all">
      <p className="text-slate-600 font-bold">
        <i className="fab fa-whatsapp text-emerald-500 mr-2 text-xl"></i> Abrir conversa com a Ana
      </p>
    </Link>
  </div>
);

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ana_chat_v2');
    return saved ? JSON.parse(saved).map((m:any) => ({...m, timestamp: new Date(m.timestamp)})) : [
      { id: '1', role: 'assistant', content: 'Oi Francimário! 🙋‍♀️ O que você gastou hoje ou o que eu preciso te lembrar?', timestamp: new Date() }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('ana_chat_v2', JSON.stringify(messages));
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await processMessageWithGemini(input, messages.map(m => ({ role: m.role, content: m.content })), { name: 'Ana', tone: 'friendly', whatsappNumber: '' });
      setMessages(prev => [...prev, { id: 'ai'+Date.now(), role: 'assistant', content: result.reply, timestamp: new Date() }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "⚠️ Francimário, preciso que você verifique minha chave de API no Render!", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col whatsapp-bg">
      <header className="bg-[#075e54] text-white p-4 flex items-center gap-4 shadow-lg z-10">
        <Link to="/" className="lg:hidden"><i className="fas fa-arrow-left"></i></Link>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/20">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" alt="Ana" className="rounded-full" />
        </div>
        <div>
          <h2 className="font-bold text-sm">Ana Secretária</h2>
          <p className="text-[10px] opacity-80 uppercase font-bold tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> online
          </p>
        </div>
      </header>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 pb-24">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl shadow-sm text-sm ${m.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none font-medium'}`}>
              {m.content}
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[9px] text-slate-400">{m.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                {m.role === 'user' && <i className="fas fa-check-double text-[9px] text-blue-400"></i>}
              </div>
            </div>
          </div>
        ))}
        {loading && <div className="bg-white/80 p-2 rounded-full text-[10px] font-bold w-fit animate-pulse px-4 border border-emerald-100">Ana está digitando...</div>}
      </div>
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-3 bg-white/95 flex gap-2 items-center border-t border-slate-200">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && send()} className="flex-1 p-3 px-5 bg-slate-100 rounded-full outline-none text-sm border border-transparent focus:border-emerald-300 transition-all" placeholder="Mensagem" />
        <button onClick={send} className="w-12 h-12 bg-[#075e54] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90"><i className="fas fa-paper-plane"></i></button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-64 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
