
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
      <div className="p-6">
        <div className="bg-slate-800/50 p-4 rounded-2xl text-center border border-slate-700/50">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" className="w-12 h-12 mx-auto rounded-full bg-slate-700 mb-2 border-2 border-emerald-400" alt="Ana" />
          <p className="text-[10px] font-black uppercase text-emerald-400 tracking-tighter">Ana Conectada</p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => (
  <div className="p-6 lg:p-12 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
    <header className="mb-10">
      <h2 className="text-4xl font-black text-slate-900 tracking-tight">Fala, Francimário! 👋</h2>
      <p className="text-slate-500 mt-1 font-medium">Sua secretária pessoal já está de prontidão para organizar seu dia.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <p className="text-slate-400 text-xs font-bold uppercase mb-1 tracking-wider">Saldo Atual</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter">R$ 4.250,00</p>
      </div>
      <div className="bg-emerald-600 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group cursor-pointer">
        <p className="text-emerald-100 text-[10px] font-bold uppercase mb-1 tracking-widest">Status da Ana</p>
        <p className="text-xl font-bold leading-tight">"Aguardando seus gastos no WhatsApp!"</p>
        <i className="fab fa-whatsapp absolute -bottom-4 -right-4 text-8xl text-white/10 rotate-12 group-hover:scale-110 transition-transform"></i>
      </div>
    </div>

    <Link to="/chat" className="block bg-emerald-50 border-2 border-dashed border-emerald-200 p-12 rounded-[2.5rem] text-center hover:bg-emerald-100/50 hover:border-emerald-400 transition-all group">
      <div className="flex flex-col items-center gap-2">
        <i className="fab fa-whatsapp text-4xl text-emerald-500 group-hover:scale-110 transition-transform mb-2"></i>
        <p className="text-emerald-900 font-black text-xl">ABRIR CHAT COM A ANA</p>
        <p className="text-emerald-600/60 text-xs font-bold uppercase tracking-widest">Simulação de Assistente Financeiro</p>
      </div>
    </Link>
  </div>
);

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('ana_chat_final');
      if (saved) {
        return JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      }
    } catch (e) { console.error("History fail"); }
    return [{ id: '1', role: 'assistant', content: 'Oi Francimário! 🙋‍♀️ Sou a Ana. Me conta o que você gastou ou ganhou hoje para eu organizar tudo!', timestamp: new Date() }];
  });
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('ana_chat_final', JSON.stringify(messages));
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const currentInput = input;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: currentInput, timestamp: new Date() };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await processMessageWithGemini(
        currentInput, 
        messages.map(m => ({ role: m.role, content: m.content })), 
        { name: 'Ana', tone: 'friendly', whatsappNumber: '' }
      );
      setMessages(prev => [...prev, { id: 'ai'+Date.now(), role: 'assistant', content: result.reply, timestamp: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "⚠️ Francimário, tive uma pequena falha na conexão. Pode verificar a chave da API e tentar de novo?", timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col whatsapp-bg animate-in fade-in duration-500">
      <header className="bg-[#075e54] text-white p-4 flex items-center gap-4 shadow-lg z-10">
        <Link to="/" className="lg:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"><i className="fas fa-arrow-left"></i></Link>
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/20 overflow-hidden">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" alt="Ana" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-sm">Ana Secretária</h2>
          <p className="text-[10px] opacity-80 uppercase font-black tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> online agora
          </p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-3 rounded-xl shadow-sm text-sm relative ${m.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none text-slate-800'}`}>
              {m.content}
              <div className="flex items-center justify-end gap-1 mt-1 opacity-50">
                <span className="text-[9px] font-bold">{m.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                {m.role === 'user' && <i className="fas fa-check-double text-[9px] text-blue-500"></i>}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="bg-white/90 p-2 rounded-full text-[10px] font-black text-emerald-600 w-fit animate-pulse px-4 border border-emerald-100 shadow-sm">
            ANA ESTÁ DIGITANDO...
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-3 bg-[#f0f2f5] flex gap-2 items-center border-t border-slate-200">
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyPress={e => e.key === 'Enter' && handleSend()} 
          className="flex-1 p-3 px-5 bg-white rounded-full outline-none text-sm shadow-sm focus:ring-1 focus:ring-emerald-400 transition-all" 
          placeholder="Digite sua mensagem" 
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 ${loading || !input.trim() ? 'bg-slate-300' : 'bg-[#00a884] text-white hover:bg-[#008f6f]'}`}
        >
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
