
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Transaction, Reminder, ChatMessage } from './types.ts';
import { processMessageWithGemini } from './services/geminiService.ts';

// --- Componentes de UI ---

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { path: '/', icon: 'fa-chart-pie', label: 'Dashboard' },
    { path: '/chat', icon: 'fa-whatsapp', label: 'Ana (WhatsApp)' },
    { path: '/config', icon: 'fa-cog', label: 'Configurações' },
  ];

  return (
    <div className="w-72 bg-slate-900 h-screen text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-10 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <i className="fas fa-robot text-slate-900 text-lg"></i>
          </div>
          <h1 className="font-black text-2xl tracking-tighter italic">FIN<span className="text-emerald-400">AI</span></h1>
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-4">Gestão Francimário</p>
      </div>
      
      <nav className="flex-1 px-6 space-y-2 mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
              location.pathname === item.path 
                ? 'bg-emerald-500 text-slate-900 shadow-xl shadow-emerald-500/10 font-black scale-105' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-center`}></i>
            <span className="text-sm font-bold">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-8">
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-[2rem] text-center">
          <p className="text-[10px] text-emerald-400 font-black uppercase mb-2">Sua Secretária</p>
          <div className="relative inline-block">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" className="w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-500/50 p-1" alt="Ana" />
             <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
          </div>
          <p className="text-xs font-bold mt-2 text-white">Ana está pronta!</p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => (
  <div className="p-12 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
    <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Olá, Francimário! 👋</h2>
        <p className="text-slate-500 font-medium mt-2 text-lg">"Organização é a chave para o sucesso."</p>
      </div>
      <div className="flex gap-4">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 text-center px-10">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Saldo Atual</p>
          <p className="text-3xl font-black text-slate-900">R$ 4.250,00</p>
        </div>
      </div>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
          <i className="fas fa-arrow-up"></i>
        </div>
        <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Receitas</h3>
        <p className="text-3xl font-black text-slate-900 mt-1">R$ 8.000,00</p>
        <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-3/4"></div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
          <i className="fas fa-arrow-down"></i>
        </div>
        <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Despesas</h3>
        <p className="text-3xl font-black text-slate-900 mt-1">R$ 3.750,00</p>
        <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-rose-500 w-1/2"></div>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
        <div className="w-12 h-12 bg-emerald-500 text-slate-900 rounded-2xl flex items-center justify-center mb-6">
          <i className="fas fa-calendar-alt"></i>
        </div>
        <h3 className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Contas a Pagar</h3>
        <p className="text-3xl font-black text-white mt-1">03 Pendentes</p>
        <p className="text-emerald-400 text-[10px] font-black mt-2 uppercase">Lembrete Ana: Amanhã</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
        <h3 className="text-2xl font-black text-slate-900 mb-8 tracking-tight">Últimas do Extrato</h3>
        <div className="space-y-4">
          {[
            { label: 'Mercado Central', val: '- R$ 250,00', color: 'text-rose-500', icon: 'fa-shopping-basket', bg: 'bg-rose-50' },
            { label: 'Salário Mensal', val: '+ R$ 8.000,00', color: 'text-emerald-500', icon: 'fa-money-check-alt', bg: 'bg-emerald-50' },
            { label: 'Posto Shell', val: '- R$ 180,00', color: 'text-rose-500', icon: 'fa-gas-pump', bg: 'bg-rose-50' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center`}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <p className="font-bold text-slate-800">{item.label}</p>
              </div>
              <p className={`font-black ${item.color}`}>{item.val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 p-10 rounded-[3rem] border border-emerald-100 flex flex-col justify-center relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black text-emerald-900 mb-4 leading-tight">Ana está no seu WhatsApp!</h3>
          <p className="text-emerald-700 text-lg mb-8 max-w-[280px] font-medium opacity-80 italic">
            "Oi! Registrei o pão de hoje, quer que eu te lembre do aluguel amanhã?"
          </p>
          <Link to="/chat" className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all inline-block">
             Conversar agora
          </Link>
        </div>
        <i className="fab fa-whatsapp absolute -bottom-20 -right-20 text-[20rem] text-emerald-500/10 rotate-12"></i>
      </div>
    </div>
  </div>
);

const WhatsAppChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('chat_history_ana');
    return saved ? JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) : [
      { id: '1', role: 'assistant', content: 'Oi Francimário! 🙋‍♀️ Sou sua secretária Ana. Como posso ajudar com suas finanças hoje?', timestamp: new Date() }
    ];
  });
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('chat_history_ana', JSON.stringify(messages));
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
    } catch (e: any) {
      const errorMsg = e.message === "API_KEY_MISSING" 
        ? "⚠️ ERRO: Sua chave da IA não foi encontrada no Render! Vá em 'Environment' e adicione a variável API_KEY."
        : "Houve um erro de conexão. Verifique se o Render terminou o deploy!";
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: errorMsg, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#efeae2]">
      <header className="bg-[#075e54] text-white p-5 flex items-center justify-between shadow-xl z-20">
        <div className="flex items-center gap-4">
          <Link to="/" className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"><i className="fas fa-arrow-left"></i></Link>
          <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center overflow-hidden border border-white/30 shadow-inner">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" alt="Ana" />
          </div>
          <div>
             <h2 className="font-bold text-base leading-tight">Ana Secretária</h2>
             <p className="text-[10px] opacity-80 flex items-center gap-1.5 font-bold uppercase tracking-wider">
               <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span> online
             </p>
          </div>
        </div>
        <div className="flex gap-6 opacity-80 pr-2">
          <i className="fas fa-video"></i>
          <i className="fas fa-phone"></i>
          <i className="fas fa-ellipsis-v"></i>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 pb-28 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-fixed">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-md relative ${
              msg.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'
            }`}>
              <p className="text-[13.5px] text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">{msg.content}</p>
              <div className="flex items-center justify-end gap-1.5 mt-1.5">
                <p className="text-[9px] text-slate-400 font-bold">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                {msg.role === 'user' && <i className="fas fa-check-double text-[9px] text-blue-400"></i>}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm animate-pulse flex items-center gap-2">
               <div className="flex gap-1">
                 <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></div>
                 <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                 <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 lg:left-72 right-0 p-4 bg-[#f0f0f0]/95 backdrop-blur-md flex gap-3 items-center border-t border-slate-200/50 z-10">
         <button className="text-slate-400 hover:text-[#075e54] transition-colors"><i className="far fa-smile text-2xl"></i></button>
         <div className="flex-1 relative">
           <input 
             type="text" 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyPress={(e) => e.key === 'Enter' && handleSend()}
             placeholder="Digite uma mensagem" 
             className="w-full bg-white p-4 px-6 rounded-[2rem] text-sm outline-none shadow-inner border border-transparent focus:border-emerald-200 transition-all"
           />
         </div>
         <button onClick={handleSend} className="w-14 h-14 bg-[#075e54] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all">
            <i className="fas fa-paper-plane text-lg"></i>
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
        <main className="flex-1 ml-72 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<WhatsAppChat />} />
            <Route path="/config" element={<div className="p-20 text-center text-slate-400">Página de Configurações em Breve</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
