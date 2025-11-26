import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Mic, Heart, Home, User, Settings, PlayCircle, 
  CheckCircle, XCircle, MessageCircle, Clock, ChevronLeft, 
  Plus, LogOut, Users, UserPlus, ArrowRight, Grid, Image as ImageIcon,
  Bell, Star, Activity, Upload, Loader, Key
} from 'lucide-react';

// --- CONFIGURACIÓN DE CONEXIÓN AWS ---
const API_URL = 'http://3.138.69.143:5000/api'; 

// --- COMPONENTES UI ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled, ...props }) => {
  const baseStyle = "w-full py-4 rounded-2xl font-bold transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-blue-200",
    senior: "bg-white border-2 border-emerald-100 text-slate-800 hover:border-emerald-500 hover:bg-emerald-50 text-xl shadow-sm",
    seniorPrimary: "bg-emerald-600 text-white text-xl shadow-emerald-200",
    danger: "bg-red-50 text-red-600 border border-red-100",
    ghost: "bg-transparent shadow-none text-slate-500 hover:bg-slate-100"
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Confetti = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
    {[...Array(20)].map((_, i) => (
      <div key={i} className="absolute animate-[fall_3s_ease-in-out_infinite]" 
           style={{
             left: `${Math.random() * 100}%`,
             top: `-${Math.random() * 20}%`,
             backgroundColor: ['#FFD700', '#FF6347', '#4CAF50', '#2196F3'][Math.floor(Math.random() * 4)],
             width: '10px', height: '10px',
             animationDelay: `${Math.random() * 2}s`,
             transform: `rotate(${Math.random() * 360}deg)`
           }} 
      />
    ))}
  </div>
);

// --- UTILIDAD PARA PUZZLES ---
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- PANTALLAS DE AUTENTICACIÓN ---

const RegisterScreen = ({ onRegister, onBack }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    familyName: '', adminName: '', email: '', password: '', 
    seniorName: '', seniorPin: '', relationship: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`¡Registro Exitoso!\n\nEl CÓDIGO DE TU FAMILIA es: ${data.joinCode}\n\nAnótalo, el abuelo lo necesitará para entrar.`);
        onRegister(data.user);
      } else {
        alert('Error al registrar: ' + data.message);
      }
    } catch (err) {
      alert('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 font-sans">
       <button onClick={onBack} className="self-start p-2 mb-4 text-slate-500 hover:bg-slate-200 rounded-full transition-colors">
         <ChevronLeft size={24} />
       </button>
       <div className="flex-1 max-w-md mx-auto w-full">
         <div className="mb-8">
           <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4 shadow-sm">
             <UserPlus size={32} />
           </div>
           <h2 className="text-3xl font-extrabold text-slate-800">Crear Cuenta</h2>
           <p className="text-slate-500 mt-2">Paso {step} de 2</p>
         </div>
         <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
           {step === 1 ? (
             <div className="space-y-4 animate-in slide-in-from-right">
               <input required placeholder="Nombre Familia (ej. Familia Ruiz)" value={formData.familyName} onChange={e => setFormData({...formData, familyName: e.target.value})} className="w-full p-4 bg-slate-50 border-0 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 transition-all" />
               <input required placeholder="Tu Nombre" value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} className="w-full p-4 bg-slate-50 border-0 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 transition-all" />
               <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-slate-50 border-0 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 transition-all" />
               <input required type="password" placeholder="Contraseña" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-4 bg-slate-50 border-0 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 transition-all" />
               <Button type="button" onClick={() => setStep(2)}>Siguiente <ArrowRight size={20}/></Button>
             </div>
           ) : (
             <div className="space-y-4 animate-in slide-in-from-right">
               <div className="bg-orange-50 p-4 rounded-xl text-sm text-orange-800 border border-orange-100 flex gap-2">
                 <Star size={16} className="shrink-0 mt-0.5" />
                 Configura el acceso simplificado para el paciente.
               </div>
               <input required placeholder="Nombre del Paciente" value={formData.seniorName} onChange={e => setFormData({...formData, seniorName: e.target.value})} className="w-full p-4 bg-slate-50 border-0 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all" />
               <input required placeholder="Tu relación (ej. Nieta)" value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})} className="w-full p-4 bg-slate-50 border-0 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all" />
               <input required type="tel" maxLength="4" placeholder="PIN de 4 dígitos (ej. 1234)" value={formData.seniorPin} onChange={e => setFormData({...formData, seniorPin: e.target.value})} className="w-full p-4 bg-slate-50 border-0 rounded-xl text-center text-2xl tracking-widest font-bold focus:ring-2 focus:ring-emerald-500 transition-all" />
               
               <Button type="submit" variant="primary" disabled={loading} className="bg-emerald-600 shadow-emerald-200">
                  {loading ? 'Registrando...' : 'Finalizar Registro'}
               </Button>
             </div>
           )}
         </form>
       </div>
    </div>
  );
};

const LoginScreen = ({ onLogin, onGoToRegister }) => {
  const [role, setRole] = useState(null);
  const [val, setVal] = useState('');
  const [familyCode, setFamilyCode] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');

    // Payload dinámico
    const payload = role === 'senior' 
        ? { role, credential: val, familyCode } 
        : { role, credential: val };

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success) {
        onLogin(data.user);
      } else {
        setErr(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error(error);
      setErr('Error de conexión. Revisa que el servidor esté encendido.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setRole(null); setVal(''); setFamilyCode(''); setErr(''); };

  if (!role) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-900/50 mx-auto rotate-3">
          <Heart size={48} className="text-white fill-white"/>
        </div>
        <h1 className="text-5xl font-black text-white mb-2 tracking-tight">Memoria<span className="text-blue-400">Viva</span></h1>
        <p className="text-slate-400 text-lg mb-10">Conectando generaciones</p>
        
        <div className="space-y-4">
          <button onClick={() => setRole('senior')} className="w-full bg-emerald-50 text-emerald-900 p-6 rounded-3xl flex items-center gap-6 hover:scale-105 transition-all shadow-xl border-b-4 border-emerald-800/10 group">
            <div className="bg-emerald-200 p-3 rounded-2xl group-hover:bg-emerald-300 transition-colors"><User size={32} className="text-emerald-800"/></div>
            <div className="text-left"><span className="block font-bold text-2xl">Soy el Abuelo</span><span className="text-emerald-700/80 font-medium">Entrar con Código</span></div>
          </button>
          
          <button onClick={() => setRole('family')} className="w-full bg-slate-800 text-white p-6 rounded-3xl flex items-center gap-6 hover:bg-slate-700 transition-all border border-slate-700 shadow-xl group">
             <div className="bg-slate-700 p-3 rounded-2xl group-hover:bg-slate-600 transition-colors"><Users size={32} className="text-blue-400"/></div>
            <div className="text-left"><span className="block font-bold text-xl">Soy Familiar</span><span className="text-slate-400">Gestionar App</span></div>
          </button>
        </div>

        <button onClick={onGoToRegister} className="mt-10 text-slate-400 text-sm flex gap-2 items-center justify-center hover:text-white transition-colors">
          <UserPlus size={16}/> ¿Nueva familia? Crea una cuenta
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${role === 'senior' ? 'bg-amber-50' : 'bg-slate-100'}`}>
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className={`p-6 ${role === 'senior' ? 'bg-emerald-600' : 'bg-slate-800'} text-white relative`}>
          <button onClick={reset} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/20 rounded-full transition-colors"><ChevronLeft/></button>
          <h2 className="text-center font-bold text-lg tracking-wide uppercase opacity-90">Acceso {role === 'senior' ? 'Abuelo' : 'Familiar'}</h2>
        </div>
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-slate-800">{role === 'senior' ? '¡Hola Abuelo!' : 'Bienvenido'}</h3>
            <p className="text-slate-500">{role === 'senior' ? 'Ingresa tu Código de Familia y PIN' : 'Ingresa tus credenciales'}</p>
          </div>
          
          {/* CAMPO CÓDIGO DE FAMILIA (Solo para Senior) */}
          {role === 'senior' && (
            <div>
                <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Código de Familia</label>
                <div className="relative">
                    <Key size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input 
                        type="text" 
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 pl-12 text-lg font-mono uppercase placeholder:normal-case outline-none focus:border-emerald-500 transition-all"
                        placeholder="Ej. FAM-8821"
                        value={familyCode} onChange={e => setFamilyCode(e.target.value.toUpperCase())}
                    />
                </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-400 ml-2 uppercase">{role === 'senior' ? 'PIN Personal' : 'Correo Electrónico'}</label>
            <input 
                type={role === 'senior' ? "tel" : "email"} 
                maxLength={role === 'senior' ? 4 : 50}
                className={`w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-5 text-center text-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all ${role === 'senior' ? 'tracking-[1em] font-bold placeholder:tracking-normal' : 'tracking-normal text-base'}`}
                placeholder={role === 'senior' ? "••••" : "correo@ejemplo.com"}
                value={val} onChange={e => setVal(e.target.value)}
            />
          </div>

          {err && <div className="text-red-500 text-center text-sm font-bold bg-red-50 p-3 rounded-xl flex items-center justify-center gap-2 animate-in slide-in-from-top"><XCircle size={16}/> {err}</div>}
          
          <Button type="submit" variant={role === 'senior' ? 'seniorPrimary' : 'primary'} disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
};

// --- VISTA DEL ABUELO (JUEGOS) ---
const SeniorView = ({ user, memories, onUpdateMemory, onLogout, loading }) => {
  const [activeMemory, setActiveMemory] = useState(null);
  const [puzzleState, setPuzzleState] = useState({ pieces: [], solved: false, selected: null });
  const [feedback, setFeedback] = useState(null);

  // --- LÓGICA DEL PUZZLE ---
  const initPuzzle = () => {
    const pieces = [0, 1, 2, 3]; 
    const shuffled = shuffleArray([...pieces]);
    setPuzzleState({ pieces: shuffled, solved: false, selected: null });
  };

  const handlePieceClick = (index) => {
    if (puzzleState.solved) return;
    if (puzzleState.selected === null) {
      setPuzzleState(prev => ({ ...prev, selected: index }));
    } else {
      const newPieces = [...puzzleState.pieces];
      const temp = newPieces[puzzleState.selected];
      newPieces[puzzleState.selected] = newPieces[index];
      newPieces[index] = temp;
      const isSolved = newPieces.every((val, idx) => val === idx);
      setPuzzleState({ pieces: newPieces, selected: null, solved: isSolved });

      if (isSolved) {
        setTimeout(() => {
          setFeedback('correct');
          setTimeout(() => {
            onUpdateMemory(activeMemory.id, { completed: true });
            setFeedback(null);
            setActiveMemory(null);
          }, 3500);
        }, 500);
      }
    }
  };

  // 1. DASHBOARD
  if (!activeMemory) {
    const pending = memories.filter(m => !m.completed);
    return (
      <div className="flex flex-col h-full bg-amber-50">
        <header className="bg-emerald-600 text-white p-6 rounded-b-[2rem] shadow-lg flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">¡Hola, {user.Name?.split(' ')[0]}! 👋</h1>
            <p className="opacity-90 text-lg">{loading ? 'Cargando...' : `Tienes ${pending.length} actividades nuevas`}</p>
          </div>
          <button onClick={onLogout} className="bg-emerald-700 p-3 rounded-xl hover:bg-emerald-800 transition-colors shadow-inner"><LogOut size={24}/></button>
        </header>

        <main className="p-6 space-y-4 overflow-y-auto flex-1">
          {loading ? (
             <div className="flex justify-center mt-10"><Loader className="animate-spin text-emerald-600" size={40}/></div>
          ) : pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 opacity-60">
              <Heart size={80} className="mb-4 text-emerald-300 fill-emerald-100"/>
              <p className="text-2xl font-medium text-slate-500">¡Todo listo por hoy!</p>
              <p>Tu familia está muy orgullosa.</p>
            </div>
          ) : (
            pending.map(m => (
              <button key={m.id} onClick={() => { setActiveMemory(m); if(m.type === 'puzzle') initPuzzle(); }} 
                className="w-full bg-white p-5 rounded-3xl shadow-sm border-b-4 border-slate-200 flex items-center gap-5 active:scale-95 active:bg-emerald-50 active:border-emerald-200 transition-all text-left group">
                <img src={m.imageUrl} className="w-24 h-24 rounded-2xl object-cover bg-slate-200 shadow-inner group-hover:scale-105 transition-transform" alt="thumb"/>
                <div className="flex-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-2 ${
                    m.type === 'puzzle' ? 'bg-pink-100 text-pink-700' : 
                    m.type === 'quiz' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {m.type === 'puzzle' ? '🧩 Puzzle' : m.type === 'quiz' ? '❓ Pregunta' : '🎙️ Historia'}
                  </span>
                  <h3 className="font-bold text-2xl text-slate-800 leading-none">{m.title}</h3>
                </div>
                <div className="bg-slate-50 p-3 rounded-full group-hover:bg-emerald-100 transition-colors">
                  <PlayCircle size={40} className="text-emerald-500 group-hover:text-emerald-600"/>
                </div>
              </button>
            ))
          )}
        </main>
      </div>
    );
  }

  // WRAPPER COMÚN PARA ACTIVIDADES
  const ActivityWrapper = ({ children, title }) => (
    <div className="flex flex-col h-full bg-amber-50">
      <div className="p-4 flex items-center gap-4">
        <button onClick={() => setActiveMemory(null)} className="p-4 bg-white rounded-full shadow-md text-slate-700 active:scale-90 transition-transform"><ChevronLeft size={28}/></button>
        <h2 className="font-bold text-2xl text-slate-800">{title}</h2>
      </div>
      <div className="flex-1 p-4 flex flex-col items-center justify-center relative">
        {children}
      </div>
    </div>
  );

  // VISTA DE ÉXITO (FEEDBACK)
  if (feedback === 'correct' || feedback === 'saved') {
    return (
      <div className="flex flex-col h-full bg-emerald-600 relative overflow-hidden items-center justify-center text-center p-8 animate-in zoom-in duration-300">
        <Confetti />
        <div className="bg-white p-8 rounded-full shadow-2xl mb-8 animate-[bounce_1s_infinite]">
          {feedback === 'saved' ? <Heart size={80} className="text-red-500 fill-red-500"/> : <CheckCircle size={80} className="text-emerald-600"/>}
        </div>
        <h2 className="text-4xl font-black text-white mb-4 drop-shadow-md">
          {feedback === 'saved' ? '¡Guardado!' : '¡Muy Bien!'}
        </h2>
        <p className="text-2xl text-emerald-100 font-medium">"{activeMemory.familyMessage || 'Gracias por compartir esto.'}"</p>
      </div>
    );
  }

  // 2. PUZZLE
  if (activeMemory.type === 'puzzle') {
    return (
      <ActivityWrapper title="Ordena la foto">
        <div className="w-full max-w-[340px] aspect-square grid grid-cols-2 gap-2 p-3 bg-white rounded-2xl shadow-xl">
          {puzzleState.pieces.map((pieceVal, index) => {
            const x = (pieceVal % 2) * 100;
            const y = Math.floor(pieceVal / 2) * 100;
            return (
              <button
                key={index}
                onClick={() => handlePieceClick(index)}
                className={`relative w-full h-full rounded-xl overflow-hidden transition-all duration-300 border-4 shadow-sm ${
                  puzzleState.selected === index ? 'border-blue-500 scale-95 z-10 ring-4 ring-blue-200' : 'border-slate-100'
                }`}
                style={{
                  backgroundImage: `url(${activeMemory.imageUrl})`,
                  backgroundSize: '200% 200%', 
                  backgroundPosition: `${x}% ${y}%`
                }}
              />
            );
          })}
        </div>
      </ActivityWrapper>
    );
  }

  // 3. QUIZ
  if (activeMemory.type === 'quiz') {
    const options = activeMemory.options || ['1998', '2015', activeMemory.correctAnswer];
    return (
      <div className="flex flex-col h-full bg-amber-50">
        <div className="h-[40%] relative">
          <img src={activeMemory.imageUrl} className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <h2 className="text-white text-3xl font-bold leading-tight drop-shadow-md">{activeMemory.question}</h2>
          </div>
          <button onClick={() => setActiveMemory(null)} className="absolute top-4 left-4 p-4 bg-white/90 rounded-full shadow-lg text-slate-800"><ChevronLeft size={28}/></button>
        </div>
        <div className="flex-1 bg-white -mt-8 rounded-t-[2.5rem] p-6 shadow-2xl relative z-10 flex flex-col justify-center gap-4">
          {options.map((opt, i) => (
            <Button key={i} variant="senior" onClick={() => {
              if(opt === activeMemory.correctAnswer) {
                setFeedback('correct');
                setTimeout(() => { onUpdateMemory(activeMemory.id, {completed:true}); setActiveMemory(null); setFeedback(null); }, 3500);
              } else {
                setFeedback('incorrect'); setTimeout(() => setFeedback(null), 1500);
              }
            }}>
              {opt}
            </Button>
          ))}
          {feedback === 'incorrect' && (
             <div className="absolute inset-x-0 bottom-0 bg-red-500 text-white p-4 text-center text-xl font-bold animate-in slide-in-from-bottom">
               Inténtalo de nuevo, tú puedes.
             </div>
          )}
        </div>
      </div>
    );
  }

  // 4. DIARIO
  if (activeMemory.type === 'diary') {
    return (
        <ActivityWrapper title={activeMemory.title}>
            <div className="w-40 h-40 bg-red-100 rounded-full flex items-center justify-center mb-8 animate-pulse text-red-500">
                <Mic size={64} />
            </div>
            <p className="text-2xl text-slate-700 font-bold mb-2">Grabando...</p>
            <p className="text-slate-500 mb-12">{activeMemory.prompt}</p>
            <Button variant="seniorPrimary" onClick={() => {
                setFeedback('saved');
                setTimeout(() => { onUpdateMemory(activeMemory.id, {completed:true}); setActiveMemory(null); setFeedback(null); }, 2500);
            }}>Terminar Grabación</Button>
        </ActivityWrapper>
    )
  }

  return <div>Vista no implementada</div>;
};

// --- VISTA FAMILIAR MEJORADA CON NOTIFICACIONES ---
const FamilyView = ({ user, memories, notifications, onAddMemory, onLogout, loading }) => {
  const [tab, setTab] = useState('feed');
  const [formType, setFormType] = useState('quiz'); 
  const fileInputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados formulario
  const [title, setTitle] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [msg, setMsg] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImgUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onAddMemory({
      type: formType,
      title, 
      imageUrl: imgUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1000&auto=format&fit=crop',
      question: formType === 'quiz' ? question : null,
      options: formType === 'quiz' ? ['1990', '2000', answer] : null,
      correctAnswer: formType === 'quiz' ? answer : null,
      pieces: formType === 'puzzle' ? 4 : null,
      prompt: formType === 'diary' ? question : null,
      familyMessage: msg
    });
    setSubmitting(false);
    setTab('feed');
    setTitle(''); setQuestion(''); setAnswer(''); setMsg(''); setImgUrl('');
  };

  const myMemories = memories;
  const myNotifications = notifications;

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-800">
      <header className="bg-white px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-blue-200">
            {user.Name?.[0]}
          </div>
          <div>
            <p className="font-bold leading-none text-slate-900">{user.Name}</p>
            <p className="text-xs text-slate-500 font-medium">{user.RelationshipToSenior || 'Admin'}</p>
          </div>
        </div>
        <div className="flex gap-4">
            <div className="relative">
                <Bell size={24} className="text-slate-400" />
                {myNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold animate-bounce">
                        {myNotifications.length}
                    </span>
                )}
            </div>
            <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition-colors"><LogOut size={24}/></button>
        </div>
      </header>

      {/* TABS FLOTANTES */}
      <div className="px-6 py-4 sticky top-[72px] z-10 bg-slate-50/95 backdrop-blur-sm">
        <div className="bg-white p-1.5 rounded-2xl flex shadow-sm border border-slate-100">
          <button onClick={() => setTab('feed')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${tab === 'feed' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
            Actividad
          </button>
          <button onClick={() => setTab('add')} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${tab === 'add' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>
            Crear +
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-6 pb-6">
        {tab === 'feed' ? (
          <div className="space-y-6 animate-in slide-in-from-left duration-500">
            {loading ? <div className="text-center py-10"><Loader className="animate-spin mx-auto text-blue-500"/></div> : (
              <>
                {/* NOTIFICACIONES RECIENTES */}
                {myNotifications.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">Nuevas Notificaciones</h3>
                        <div className="space-y-3">
                            {myNotifications.map(n => (
                                <div key={n.id} className="bg-white border-l-4 border-l-emerald-500 p-4 rounded-xl shadow-sm flex gap-3 animate-in slide-in-from-right">
                                    <div className="bg-emerald-100 p-2 rounded-full h-fit"><CheckCircle size={16} className="text-emerald-600"/></div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{n.text}</p>
                                        <p className="text-xs text-slate-400 mt-1">Hace un momento</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Historial</h3>
                {myMemories.filter(m => m.completed).length === 0 && <p className="text-sm text-slate-400 italic text-center py-8">Aún no hay actividad completada.</p>}
                
                <div className="space-y-4">
                    {myMemories.filter(m => m.completed).map(m => (
                    <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                            {m.type === 'puzzle' ? <Grid size={20} className="text-pink-500"/> : m.type === 'quiz' ? <MessageCircle size={20} className="text-purple-500"/> : <Mic size={20} className="text-orange-500"/>}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-800">{m.type === 'puzzle' ? 'Armó el puzzle:' : 'Respondió:'} {m.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Completado exitosamente</p>
                        </div>
                    </div>
                    ))}
                </div>
                
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-8 ml-1">Pendientes por hacer</h3>
                <div className="grid grid-cols-2 gap-3">
                  {myMemories.filter(m => !m.completed).map(m => (
                     <div key={m.id} className="aspect-square rounded-2xl relative overflow-hidden bg-slate-200 shadow-inner group">
                       <img src={m.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500"/>
                       <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm uppercase">{m.type}</span>
                     </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleAdd} className="space-y-6 animate-in slide-in-from-right duration-500">
            
            {/* Type Selector */}
            <div className="grid grid-cols-3 gap-3">
              {[
                {id: 'quiz', icon: MessageCircle, label: 'Quiz', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200'},
                {id: 'puzzle', icon: Grid, label: 'Puzzle', color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200'},
                {id: 'diary', icon: Mic, label: 'Diario', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200'}
              ].map(t => (
                <button type="button" key={t.id} onClick={() => setFormType(t.id)}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${formType === t.id ? `${t.border} ${t.bg} ${t.color} scale-105 shadow-md` : 'border-slate-100 bg-white text-slate-400'}`}>
                  <t.icon size={28}/>
                  <span className="text-xs font-bold">{t.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
               <div>
                 <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Título</label>
                 <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 mt-1 bg-slate-50 border-0 rounded-xl font-medium focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Ej. Cumpleaños 80"/>
               </div>

               {/* UPLOAD FOTO MEJORADO */}
               <div>
                 <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Foto de la actividad</label>
                 <input 
                   type="file" 
                   accept="image/*" 
                   ref={fileInputRef}
                   className="hidden"
                   onChange={handleFileChange}
                 />
                 <div 
                   onClick={() => fileInputRef.current.click()}
                   className="mt-1 border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors relative overflow-hidden"
                 >
                   {imgUrl ? (
                     <>
                       <img src={imgUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                       <div className="relative z-10 bg-white/80 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 text-slate-800 backdrop-blur-sm">
                         <ImageIcon size={16} /> Cambiar Foto
                       </div>
                     </>
                   ) : (
                     <>
                       <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                         <Upload size={24} />
                       </div>
                       <span className="text-sm font-bold text-slate-500">Toca para subir imagen</span>
                     </>
                   )}
                 </div>
               </div>
               
               {formType === 'quiz' && (
                 <>
                  <div>
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Pregunta</label>
                    <input required value={question} onChange={e => setQuestion(e.target.value)} className="w-full p-4 mt-1 bg-slate-50 border-0 rounded-xl font-medium" placeholder="¿Quién está a tu lado?"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Respuesta Correcta</label>
                    <input required value={answer} onChange={e => setAnswer(e.target.value)} className="w-full p-4 mt-1 bg-slate-50 border-0 rounded-xl font-medium" placeholder="Tu nieto Marcos"/>
                  </div>
                 </>
               )}

               {formType === 'puzzle' && (
                 <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-800 border border-blue-100 flex gap-2 items-start">
                   <Activity size={18} className="mt-0.5 shrink-0"/>
                   La foto se dividirá automáticamente en 4 piezas.
                 </div>
               )}

               {formType === 'diary' && (
                 <div>
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Tema a narrar</label>
                    <input required value={question} onChange={e => setQuestion(e.target.value)} className="w-full p-4 mt-1 bg-slate-50 border-0 rounded-xl font-medium" placeholder="Cuéntanos qué pasaba este día..."/>
                 </div>
               )}

               <div>
                 <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Mensaje de felicitación</label>
                 <input required value={msg} onChange={e => setMsg(e.target.value)} className="w-full p-4 mt-1 bg-slate-50 border-0 rounded-xl font-medium" placeholder="¡Muy bien! Qué memoria tienes."/>
               </div>
            </div>

            <Button type="submit" disabled={submitting}>{submitting ? 'Publicando...' : 'Publicar Actividad'}</Button>
          </form>
        )}
      </main>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function MemoriaVivaApp() {
  const [user, setUser] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [memories, setMemories] = useState([]); // Inicia vacío, se llena desde API
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // FUNCIONES DE API

  const fetchMemories = async (familyId) => {
    setLoadingMemories(true);
    try {
      const res = await fetch(`${API_URL}/memories/${familyId}`);
      const data = await res.json();
      if(Array.isArray(data)) {
        setMemories(data);
      }
    } catch (err) {
      console.error("Error fetching memories", err);
    } finally {
      setLoadingMemories(false);
    }
  };

  const fetchNotifications = async (familyId) => {
      try {
          const res = await fetch(`${API_URL}/notifications/${familyId}`);
          const data = await res.json();
          if(Array.isArray(data)) setNotifications(data);
      } catch (err) { console.error(err); }
  }

  const handleLogin = (loggedUser) => {
    setUser(loggedUser); 
    setRegistering(false);
    if(loggedUser.FamilyId) {
      fetchMemories(loggedUser.FamilyId);
      fetchNotifications(loggedUser.FamilyId);
    }
  };

  const handleUpdate = async (id, changes) => {
    // Optimistic Update en UI
    setMemories(prev => prev.map(m => m.id === id ? {...m, ...changes} : m));

    if (changes.completed) {
        try {
          await fetch(`${API_URL}/memories/${id}/complete`, { method: 'PATCH' });
          
          // Crear notificación local (en prod vendría de websocket/polling)
          const memory = memories.find(m => m.id === id);
          if (memory) {
            const newNotification = {
                id: Date.now(),
                familyId: memory.familyId,
                text: `¡El abuelo completó "${memory.title}"!`,
                read: false,
                timestamp: new Date().toISOString()
            };
            setNotifications(prev => [newNotification, ...prev]);
          }
        } catch (err) {
          console.error("Error updating memory", err);
          // Revertir si falla (opcional)
        }
    }
  };

  const handleAdd = async (data) => {
    // data contiene: type, title, imageUrl, question...
    // Añadimos familyId del usuario actual
    const payload = { ...data, familyId: user.FamilyId, creatorId: user.UserId };

    try {
      const res = await fetch(`${API_URL}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      
      if(result.success) {
        // Recargar memorias para tener el ID real y todo sincronizado
        fetchMemories(user.FamilyId);
      }
    } catch (err) {
      console.error("Error creating memory", err);
    }
  };

  if (registering) return <RegisterScreen onRegister={handleLogin} onBack={() => setRegistering(false)}/>;
  if (!user) return <LoginScreen onLogin={handleLogin} onGoToRegister={() => setRegistering(true)}/>;

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-slate-50 shadow-2xl overflow-hidden font-sans">
      {user.Role === 'senior' ? (
        <SeniorView user={user} memories={memories} onUpdateMemory={handleUpdate} onLogout={() => setUser(null)} loading={loadingMemories}/>
      ) : (
        <FamilyView user={user} memories={memories} notifications={notifications} onAddMemory={handleAdd} onLogout={() => setUser(null)} loading={loadingMemories}/>
      )}
    </div>
  );
}