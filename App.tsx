
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Reminder } from './types';

// --- Core AI Logic ---
const askAna = async (message: string, history: any[]) => {
  const apiKey = window.process?.env?.API_KEY || (window as any).RENDER_ENV?.API_KEY;
  if (!apiKey) return { reply: "⚠️ Chave API não encontrada." };

  try {
    const ai = new GoogleGenAI({ apiKey });
    const modelName = "gemini-3-flash-preview";

    const systemInstruction = `
      Você é a "Ana", a secretária financeira pessoal do usuário.
      Sua missão: organizar gastos, lembrar de contas e compromissos.
      Estilo: WhatsApp, amigável, usa emojis (💰, ✅, 📉).
      
      Regras de Resposta:
      1. Se o usuário informar um gasto ou ganho, extraia para 'transaction'.
      2. Se o usuário pedir um lembrete ou agendamento, extraia para 'reminder'.
      3. Use 'income' para ganhos e 'expense' para gastos.
      
      Data de hoje: ${new Date().toLocaleDateString('pt-BR')}.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        ...history.slice(-6).map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: { 
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { 
            reply: { type: Type.STRING },
            transaction: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                type: { type: Type.STRING, enum: ['income', 'expense'] },
                category: { type: Type.STRING }
              }
            },
            reminder: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                dueDate: { type: Type.STRING },
                amount: { type: Type.NUMBER }
              }
            }
          },
          required: ["reply"]
        }
      }
    });

    return JSON.parse(response.text || '{"reply": "Anotado!"}');
  } catch (err) {
    console.error("AI Error:", err);
    return { reply: "Tive um probleminha técnico, mas pode continuar! 😊" };
  }
};

// --- Components ---

const Sidebar = () => {
  const loc = useLocation();
  const menu = [
    { path: '/', icon: 'fa-house', label: 'Painel' },
    { path: '/chat', icon: 'fa-comment-dots', label: 'Ana AI' },
    { path: '/transactions', icon: 'fa-receipt', label: 'Transações' }
  ];

  return (
    <div className="hidden md:flex w-64 bg-slate-900 h-screen flex-col border-r border-slate-800 shrink-0">
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
        <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" className="w-10 h-10 rounded-full border border-emerald-400 bg-slate-700 shadow-inner" />
          <div>
            <p className="text-white text-xs font-bold">Ana Secretária</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ transactions, reminders }: { transactions: Transaction[], reminders: Reminder[] }) => {
  const balance = useMemo(() => {
    return transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
  }, [transactions]);

  const expenses = useMemo(() => {
    return transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Painel Financeiro 👋</h1>
          <p className="text-slate-500 font-medium italic mt-1">Organizando seu futuro com inteligência.</p>
        </div>
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Saldo em Conta</p>
          <h3 className={`text-3xl font-black ${balance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h3>
          <span className="text-emerald-500 text-xs font-bold mt-2 inline-block">Atualizado via Ana</span>
        </div>
        
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Saídas Totais</p>
          <h3 className="text-3xl font-black text-rose-500">
            {expenses.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </h3>
          <span className="text-slate-400 text-xs mt-2 inline-block">{transactions.filter(t => t.type === 'expense').length} registros</span>
        </div>

        <Link to="/chat" className="bg-emerald-600 p-6 rounded-[2.5rem] text-white shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all flex flex-col justify-center">
          <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest mb-2">Comando de Voz/Texto</p>
          <h3 className="text-xl font-bold leading-tight">"Ana, gastei R$ 20..."</h3>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium bg-emerald-500/30 w-fit px-3 py-1 rounded-full">
            <i className="fas fa-comment-dots"></i> Falar agora
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-slate-50 font-bold text-slate-800 flex justify-between items-center">
            <span>Atividade Recente</span>
            <Link to="/transactions" className="text-xs text-emerald-600 hover:underline">Ver tudo</Link>
          </div>
          <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            {transactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                <i className="fas fa-receipt text-5xl"></i>
                <p className="font-medium">Nenhuma transação ainda.</p>
              </div>
            ) : (
              transactions.slice().reverse().map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                  <div className="flex flex-col">
                    <span className="text-slate-700 font-semibold text-sm">{t.description}</span>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">{t.category} • {new Date(t.date).toLocaleDateString()}</span>
                  </div>
                  <span className={`font-black text-sm ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-slate-50 font-bold text-slate-800">Lembretes & Contas</div>
          <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            {reminders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                <i className="fas fa-calendar-check text-5xl"></i>
                <p className="font-medium">Nenhum lembrete pendente.</p>
              </div>
            ) : (
              reminders.map(r => (
                <div key={r.id} className="flex items-center gap-4 p-4 border border-slate-100 rounded-3xl hover:border-emerald-200 transition-colors">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${r.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                    <i className={`fas ${r.status === 'completed' ? 'fa-check' : 'fa-clock'}`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800 font-bold text-sm">{r.title}</p>
                    <p className="text-slate-400 text-[10px] uppercase font-black">Vencimento: {r.dueDate}</p>
                  </div>
                  {r.amount && (
                    <span className="font-bold text-slate-800 text-sm">R$ {r.amount}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Chat = ({ onAction }: { onAction: (data: any) => void }) => {
  const [messages, setMessages] = useState<any[]>(() => {
    const saved = localStorage.getItem('ana_chat_v5');
    return saved ? JSON.parse(saved) : [{ 
      id: '1', role: 'assistant', content: 'Oi! Sou a Ana, sua secretária. Vamos organizar suas finanças hoje? 💰', time: 'Agora' 
    }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('ana_chat_v5', JSON.stringify(messages));
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input, 
      time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) 
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const result = await askAna(input, messages);
    
    setMessages(prev => [...prev, {
      id: 'ana-' + Date.now(),
      role: 'assistant',
      content: result.reply || "Anotado! ✅",
      time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    }]);

    if (result.transaction || result.reminder) {
      onAction(result);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-[#075e54] text-white p-4 flex items-center gap-4 shrink-0 shadow-lg">
        <Link to="/" className="md:hidden p-2"><i className="fas fa-arrow-left"></i></Link>
        <div className="relative">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" className="w-10 h-10 rounded-full bg-emerald-100 shadow-inner" />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#075e54] rounded-full"></span>
        </div>
        <div>
          <h2 className="font-bold text-sm leading-tight">Ana Secretária</h2>
          <p className="text-[10px] uppercase font-black opacity-70 tracking-widest">Digitando...</p>
        </div>
        <div className="ml-auto flex gap-4 text-lg">
           <i className="fas fa-video opacity-50"></i>
           <i className="fas fa-phone opacity-50"></i>
           <i className="fas fa-ellipsis-v"></i>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto whatsapp-bg p-4 space-y-4 custom-scrollbar">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm relative ${m.role === 'user' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{m.content}</p>
              <div className="flex items-center justify-end gap-1 mt-1">
                <span className="text-[9px] text-slate-400 font-bold">{m.time}</span>
                {m.role === 'user' && <i className="fas fa-check-double text-[9px] text-emerald-500"></i>}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-full text-[10px] font-bold text-emerald-600 animate-pulse w-fit shadow-md border border-emerald-100">
            Ana está organizando os dados...
          </div>
        )}
      </div>

      <div className="p-3 bg-[#f0f2f5] flex items-center gap-2 border-t shrink-0">
        <div className="flex gap-4 px-2 text-slate-500 text-lg">
           <i className="far fa-smile hover:text-emerald-600 cursor-pointer"></i>
           <i className="fas fa-paperclip hover:text-emerald-600 cursor-pointer"></i>
        </div>
        <input 
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Digite ou fale com a Ana..."
          className="flex-1 bg-white p-3 px-5 rounded-full outline-none text-sm border-none shadow-sm focus:ring-2 ring-emerald-500 transition-all"
        />
        <button 
          onClick={handleSend} 
          disabled={loading}
          className={`w-12 h-12 ${loading ? 'bg-slate-300' : 'bg-[#00a884]'} text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-[#008f70]`}
        >
          {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-paper-plane"></i>}
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fin_transactions_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('fin_reminders_v2');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('fin_transactions_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fin_reminders_v2', JSON.stringify(reminders));
  }, [reminders]);

  const handleAIAction = (data: any) => {
    if (data.transaction) {
      const newT: Transaction = {
        id: Date.now().toString(),
        description: data.transaction.description,
        amount: data.transaction.amount,
        type: data.transaction.type,
        category: data.transaction.category || 'Geral',
        date: new Date().toISOString()
      };
      setTransactions(prev => [...prev, newT]);
    }
    if (data.reminder) {
      const newR: Reminder = {
        id: 'rem-' + Date.now(),
        title: data.reminder.title,
        dueDate: data.reminder.dueDate || 'Em breve',
        status: 'pending',
        amount: data.reminder.amount
      };
      setReminders(prev => [...prev, newR]);
    }
  };

  return (
    <Router>
      <div className="flex h-screen w-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard transactions={transactions} reminders={reminders} />} />
            <Route path="/chat" element={<Chat onAction={handleAIAction} />} />
            <Route path="/transactions" element={
              <div className="p-6 md:p-12 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900">Histórico de Transações</h2>
                  <button onClick={() => { if(confirm('Limpar histórico?')) setTransactions([]); }} className="text-xs font-bold text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-xl transition-colors">LIMPAR TUDO</button>
                </div>
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                   {transactions.length === 0 ? (
                     <p className="p-20 text-center text-slate-400 font-medium">Nenhum registro encontrado.</p>
                   ) : (
                     <div className="divide-y divide-slate-50">
                       {transactions.slice().reverse().map(t => (
                         <div key={t.id} className="p-6 flex justify-between items-center hover:bg-slate-50">
                            <div>
                               <p className="font-bold text-slate-800">{t.description}</p>
                               <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                            </div>
                            <span className={`font-black ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                               {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                         </div>
                       ))}
                     </div>
                   )}
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
