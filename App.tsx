
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Transaction, Reminder, AssistantConfig, ChatMessage, FinancialData } from './types';
import { processMessageWithGemini } from './services/geminiService';

// --- Components ---

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { path: '/', icon: 'fa-home', label: 'Início' },
    { path: '/chat', icon: 'fa-whatsapp', label: 'Conversar com Ana' },
    { path: '/transactions', icon: 'fa-receipt', label: 'Meus Gastos' },
    { path: '/reminders', icon: 'fa-clock', label: 'Lembretes' },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8 border-b border-slate-800">
        <h1 className="font-black text-2xl tracking-tighter">ANA<span className="text-emerald-400">.</span></h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Sua Secretária</p>
      </div>
      <nav className="flex-1 mt-8 px-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${
              location.pathname === item.path 
                ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20 font-bold' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-center`}></i>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

const Dashboard = () => (
  <div className="p-12 max-w-5xl mx-auto">
    <div className="bg-emerald-500 p-12 rounded-[3rem] text-slate-900 shadow-2xl relative overflow-hidden mb-12">
      <div className="relative z-10">
        <h2 className="text-5xl font-black tracking-tighter mb-4 italic">Problema Resolvido!</h2>
        <p className="text-xl font-medium opacity-90 max-w-xl leading-relaxed">
          Francimário, adicionei um arquivo <strong>Dockerfile</strong>. Agora o Render vai funcionar no modo Docker mesmo! 
        </p>
        <div className="mt-8 flex gap-4">
           <Link to="/chat" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase shadow-xl hover:scale-105 transition-transform">
              Ir para o Chat <i className="fas fa-arrow-right ml-2"></i>
           </Link>
        </div>
      </div>
      <i className="fas fa-check-circle absolute -bottom-10 -right-10 text-[15rem] opacity-10"></i>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
         <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <i className="fas fa-wallet"></i>
         </div>
         <h3 className="font-bold text-slate-800">Saldo Atual</h3>
         <p className="text-2xl font-black text-slate-900 mt-2">R$ 0,00</p>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
         <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
            <i className="fas fa-bell"></i>
         </div>
         <h3 className="font-bold text-slate-800">Lembretes Hoje</h3>
         <p className="text-2xl font-black text-slate-900 mt-2">Nenhum</p>
      </div>
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
         <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <i className="fas fa-chart-pie"></i>
         </div>
         <h3 className="font-bold text-slate-800">Economia</h3>
         <p className="text-2xl font-black text-slate-900 mt-2">100%</p>
      </div>
    </div>
  </div>
);

const WhatsAppChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Olá Francimário! Sou a Ana, sua secretária. Pode me mandar seus gastos ou pedir para eu lembrar de algo. Como posso te ajudar hoje?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await processMessageWithGemini(input, messages.map(m => ({ role: m.role, content: m.content })), { name: 'Ana', tone: 'friendly', whatsappNumber: '' });
      const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: result.reply, timestamp: new Date() };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: 'Ops, tive um erro de conexão. Tente novamente!', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#e5ddd5] relative">
      <header className="bg-[#075e54] text-white p-4 flex items-center gap-4 shadow-lg z-10">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
           <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" alt="Ana" />
        </div>
        <div>
           <h2 className="font-bold text-sm">Ana (Secretária)</h2>
           <p className="text-[10px] opacity-80">online</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 pb-24">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl shadow-sm relative ${
              msg.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'
            }`}>
              <p className="text-sm text-slate-800 leading-relaxed">{msg.content}</p>
              <p className="text-[9px] text-slate-400 text-right mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && <div className="text-[10px] text-slate-500 italic animate-pulse">Ana está digitando...</div>}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#f0f0f0] flex gap-3 items-center">
         <input 
           type="text" 
           value={input}
           onChange={(e) => setInput(e.target.value)}
           onKeyPress={(e) => e.key === 'Enter' && handleSend()}
           placeholder="Digite uma mensagem..." 
           className="flex-1 bg-white p-3 rounded-full text-sm outline-none shadow-sm"
         />
         <button onClick={handleSend} className="w-12 h-12 bg-[#075e54] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
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
        <main className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<WhatsAppChat />} />
            <Route path="/transactions" element={<div className="p-20 text-center text-slate-400">Suas transações aparecerão aqui conforme você falar com a Ana.</div>} />
            <Route path="/reminders" element={<div className="p-20 text-center text-slate-400">Seus lembretes agendados aparecerão aqui.</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
