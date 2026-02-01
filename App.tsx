
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
        <h1 className="font-black text-2xl italic tracking-tighter">FIN<span className="text-emerald-400">AI</span></h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase mt-2 tracking-widest opacity-60">Assistente Francimário</p>
      </div>
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
              location.pathname === item.path ? 'bg-emerald-500 text-slate-900 font-bold shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-6 mt-auto">
        <div className="bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-700/50">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" className="w-12 h-12 mx-auto rounded-full bg-slate-700 mb-2 border-2 border-emerald-400" alt="Ana" />
          <p className="text-[10px] font-black uppercase text-emerald-400 tracking-tighter">Ana Online</p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => (
  <div className="p-6 lg:p-12 max-w-5xl mx-auto animate-in fade-in duration-500">
    <header className="mb-10">
      <h2 className="text-4xl font-black text-slate-900 tracking-tight">Fala, Francimário! 👋</h2>
      <p className="text-slate-500 mt-1 font-medium">Aqui está o resumo da sua vida financeira hoje.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <p className="text-slate-400 text-xs font-bold uppercase mb-1 tracking-wider">Saldo Estimado</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter">R$ 4.250,00</p>
      </div>
      <div className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
        <p className="text-emerald-100 text-[10px] font-bold uppercase mb-1 tracking-widest">Secretária Ativa</p>
        <p className="text-xl font-bold leading-tight">Envie seus gastos para a Ana organizar tudo.</p>
        <i className="fab fa-whatsapp absolute -bottom-4 -right-4 text-8xl text-white/10 rotate-12"></i>
      </div>
    </div>

    <Link to="/chat" className="block bg-emerald-50 border-2 border-dashed border-emerald-200 p-12 rounded-[2.5rem] text-center hover:bg-emerald-100/50 hover:border-emerald-400 transition-all">
      <i className="fab fa-whatsapp text-4xl text-emerald-500 mb-4 block"></i>
      <p className="text-emerald-900 font-black text-xl">ABRIR CONVERSA COM A ANA</p>
      <p className="text-emerald-600/60 text-xs font-bold uppercase mt-2">Clique para simular o chat</p>
    </Link>
  </div>
);

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('ana_chat_final_v2');
      if (saved) {
        return JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch (e) { console.warn("Novo chat iniciado"); }
    return [{ id: '1', role: 'assistant', content: 'Oi Francimário! 🙋‍♀️ Sou sua secretária. O que você gastou hoje?', timestamp: new Date() }];
  });
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('ana_chat_final_v2', JSON.stringify(messages));
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: msg, timestamp: new Date() };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await processMessageWithGemini(
        msg, 
        messages.map(m => ({ role: m.role, content: m.content })), 
        { name: 'Ana', tone: 'friendly', whatsappNumber: '' }
      );
      setMessages(prev => [...prev, { id: 'ai'+Date.now(), role: 'assistant', content: result.reply, timestamp: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "⚠️ Francimário, tive um erro na conexão. Verifique se sua chave da API está correta no Render.", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col whatsapp-bg animate-in fade-in duration-300">
      <header className="bg-[#075e54] text-white p-4 flex items-center gap-4 shadow-lg z-10">
        <Link to="/" className="lg:hidden"><i className="fas fa-arrow-left"></i></Link>
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" className="w-10 h-10 rounded-full bg-white/20" alt="Ana" />
        <div className="flex-1">
          <h2 className="font-bold text-sm">Ana Secretária</h2>
          <p className="text-[10px] opacity-80 uppercase font-black">online agora</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl shadow-sm text-sm ${m.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
              {m.content}
              <p className="text-[9px] text-right opacity-40 mt-1">{m.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
        ))}
        {loading && <div className="text-[10px] bg-white p-2 rounded-lg w-fit animate-pulse text-emerald-600 font-bold">Digitando...</div>}
      </div>

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-3 bg-[#f0f2f5] flex gap-2 border-t">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyPress={e => e.key === 'Enter' && handleSend()} 
          className="flex-1 p-3 rounded-full outline-none text-sm shadow-sm" 
          placeholder="Mensagem" 
        />
        <button onClick={handleSend} className="w-12 h-12 bg-[#00a884] text-white rounded-full flex items-center justify-center shadow-lg">
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <div className="flex bg-slate-50 min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
