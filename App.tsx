
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Transaction, Reminder, ChatMessage } from './types';
import { processMessageWithGemini } from './services/geminiService';

// --- Componentes de UI ---

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { path: '/', icon: 'fa-chart-line', label: 'Resumo' },
    { path: '/chat', icon: 'fa-whatsapp', label: 'Ana (WhatsApp)' },
    { path: '/transacoes', icon: 'fa-receipt', label: 'Extrato' },
    { path: '/lembretes', icon: 'fa-bell', label: 'Lembretes' },
  ];

  return (
    <div className="w-72 bg-slate-900 h-screen text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <i className="fas fa-wallet text-slate-900 text-lg"></i>
          </div>
          <h1 className="font-black text-2xl tracking-tighter">ANA<span className="text-emerald-400">.</span></h1>
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">Secretária Financeira</p>
      </div>
      
      <nav className="flex-1 px-6 space-y-2 mt-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${
              location.pathname === item.path 
                ? 'bg-emerald-500 text-slate-900 shadow-xl shadow-emerald-500/10 font-bold' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <i className={`fas ${item.icon} w-5`}></i>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-8 border-t border-slate-800">
        <div className="bg-slate-800/40 p-5 rounded-[2rem] border border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase text-emerald-400">Sistema Ativo</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Ana está monitorando suas contas em tempo real.
          </p>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => (
  <div className="p-12 max-w-6xl mx-auto animate-in fade-in duration-700">
    <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
      <div>
        <span className="text-emerald-500 font-bold text-xs uppercase tracking-[0.2em]">Dashboard Principal</span>
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter mt-2">Bom dia, Francimário!</h2>
        <p className="text-slate-500 font-medium mt-2 text-lg italic">"O controle é o primeiro passo para a liberdade."</p>
      </div>
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 min-w-[280px]">
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Saldo em Conta</p>
        <div className="flex items-baseline gap-1">
          <span className="text-slate-400 font-bold text-lg">R$</span>
          <span className="text-4xl font-black text-slate-900">4.250,00</span>
        </div>
      </div>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <div className="group bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 hover:border-emerald-500 transition-all duration-500">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <i className="fas fa-plus-circle text-xl"></i>
        </div>
        <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Renda Mensal</h3>
        <p className="text-3xl font-black text-slate-900 mt-1">R$ 8.000,00</p>
        <p className="text-emerald-500 text-xs font-bold mt-2 flex items-center gap-1">
          <i className="fas fa-caret-up"></i> +12% vs mês passado
        </p>
      </div>

      <div className="group bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 hover:border-rose-500 transition-all duration-500">
        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <i className="fas fa-minus-circle text-xl"></i>
        </div>
        <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Despesas Fixas</h3>
        <p className="text-3xl font-black text-slate-900 mt-1">R$ 3.750,00</p>
        <p className="text-rose-500 text-xs font-bold mt-2 flex items-center gap-1">
          <i className="fas fa-caret-down"></i> Dentro do limite
        </p>
      </div>

      <div className="group bg-slate-900 p-8 rounded-[3rem] shadow-2xl shadow-slate-200">
        <div className="w-14 h-14 bg-emerald-500 text-slate-900 rounded-2xl flex items-center justify-center mb-6">
          <i className="fas fa-calendar-check text-xl"></i>
        </div>
        <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">Lembretes Ana</h3>
        <p className="text-3xl font-black text-white mt-1">03 Contas</p>
        <p className="text-emerald-400 text-xs font-bold mt-2 italic">Próxima: Aluguel amanhã</p>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Agenda da Semana</h3>
          <button className="bg-slate-50 text-slate-900 px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors">Ver Completa</button>
        </div>
        <div className="space-y-4">
          {[
            { title: 'Aluguel Apartamento', val: 'R$ 1.500', date: 'Vence Amanhã', status: 'pendente', icon: 'fa-home', color: 'bg-blue-100 text-blue-600' },
            { title: 'Internet Fibra', val: 'R$ 120', date: 'Vence em 5 dias', status: 'pendente', icon: 'fa-wifi', color: 'bg-purple-100 text-purple-600' },
            { title: 'Cartão de Crédito', val: 'R$ 890', date: 'Vence em 10 dias', status: 'atrasado', icon: 'fa-credit-card', color: 'bg-rose-100 text-rose-600' }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-5 hover:bg-slate-50 rounded-[2rem] transition-all border border-transparent hover:border-slate-100 group">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-xl`}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <div>
                  <p className="font-black text-slate-800">{item.title}</p>
                  <p className="text-xs font-medium text-slate-400">{item.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-slate-900 text-lg">{item.val}</p>
                <span className={`text-[9px] font-black uppercase tracking-widest ${item.status === 'atrasado' ? 'text-rose-500' : 'text-emerald-500'}`}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-600 p-12 rounded-[4rem] text-white flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-emerald-200">
        <div className="relative z-10">
          <div className="w-20 h-20 bg-white/20 rounded-[2.5rem] flex items-center justify-center mb-8 backdrop-blur-md border border-white/30">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" alt="Ana" className="w-14" />
          </div>
          <h3 className="text-4xl font-black leading-tight mb-4">Oi! Vamos organizar <br/> hoje? 🚀</h3>
          <p className="text-emerald-100 text-lg font-medium max-w-xs opacity-90">
            Mande uma mensagem para a Ana agora mesmo e deixe ela cuidar da burocracia.
          </p>
        </div>
        
        <Link to="/chat" className="relative z-10 bg-white text-emerald-600 px-10 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-emerald-50 hover:scale-105 transition-all mt-12 inline-block text-center">
           Abrir WhatsApp da Ana
        </Link>
        
        <i className="fab fa-whatsapp absolute -bottom-20 -right-20 text-[25rem] text-white/5 rotate-12"></i>
      </div>
    </div>
  </div>
);

const WhatsAppChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('ana_chat_history');
    return saved ? JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) : [
      { id: '1', role: 'assistant', content: 'Olá Francimário! 🙋‍♀️ Sou sua secretária Ana. Já configurei o comando "npm start" lá no Render? Se sim, estou pronta! O que vamos anotar hoje?', timestamp: new Date() }
    ];
  });
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('ana_chat_history', JSON.stringify(messages));
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
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: 'Ops! O servidor ainda está reiniciando ou a API_KEY está errada. Tente novamente em 1 minuto!', timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm('Deseja limpar o histórico?')) {
      localStorage.removeItem('ana_chat_history');
      window.location.reload();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#efeae2]">
      <header className="bg-[#075e54] text-white p-5 flex items-center justify-between shadow-lg z-20">
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
          <button onClick={clearChat} title="Limpar Histórico" className="hover:text-red-300 transition-colors"><i className="fas fa-trash-alt"></i></button>
          <i className="fas fa-video"></i>
          <i className="fas fa-phone"></i>
          <i className="fas fa-ellipsis-v"></i>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 pb-28 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-fixed">
        <div className="flex justify-center mb-6">
          <span className="bg-[#d1e4f4] text-slate-600 text-[10px] font-black uppercase px-4 py-1.5 rounded-lg shadow-sm">Hoje</span>
        </div>
        
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
               <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Ana digitando</span>
             </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 lg:left-72 right-0 p-4 bg-[#f0f0f0]/95 backdrop-blur-md flex gap-3 items-center border-t border-slate-200/50 z-10">
         <button className="text-slate-400 hover:text-[#075e54] transition-colors"><i className="far fa-smile text-2xl"></i></button>
         <button className="text-slate-400 hover:text-[#075e54] transition-colors"><i className="fas fa-plus text-xl"></i></button>
         <div className="flex-1 relative">
           <input 
             type="text" 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyPress={(e) => e.key === 'Enter' && handleSend()}
             placeholder="Digite uma mensagem" 
             className="w-full bg-white p-3.5 px-5 rounded-2xl text-sm outline-none shadow-inner border border-transparent focus:border-emerald-200 transition-all"
           />
         </div>
         {input.trim() ? (
           <button onClick={handleSend} className="w-12 h-12 bg-[#075e54] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all">
              <i className="fas fa-paper-plane text-base"></i>
           </button>
         ) : (
           <button className="w-12 h-12 bg-[#075e54] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all">
              <i className="fas fa-microphone text-lg"></i>
           </button>
         )}
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
            <Route path="/transacoes" element={<div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Extrato Automático em Breve</div>} />
            <Route path="/lembretes" element={<div className="p-20 text-center text-slate-400 font-bold uppercase tracking-widest">Gestor de Contas em Breve</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
