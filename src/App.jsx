import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, Mic, Heart, Home, User, Settings, PlayCircle, 
  CheckCircle, XCircle, MessageCircle, Clock, ChevronLeft, 
  Plus, LogOut, Users, UserPlus, ArrowRight, Grid, Image as ImageIcon,
  Bell, Star, Activity, Upload, Loader, Key, Lock, RefreshCw, AlertTriangle
} from 'lucide-react';

// --- CONFIGURACIÓN DE CONEXIÓN AWS ---
const API_URL = 'http://3.138.69.143:5000/api'; 

// --- COMPONENTES UI ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled, ...props }) => {
  const baseStyle = "w-full py-5 rounded-3xl font-bold text-xl transition-all transform active:scale-95 shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-blue-200",
    senior: "bg-white border-2 border-emerald-100 text-slate-800 hover:border-emerald-500 hover:bg-emerald-50 text-xl shadow-sm",
    seniorPrimary: "bg-emerald-600 text-white text-2xl shadow-emerald-200", // Botones más grandes para el abuelo
    danger: "bg-red-50 text-red-600 border border-red-100",
    ghost: "bg-transparent shadow-none text-slate-500 hover:bg-slate-100"
  };
  return <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Confetti = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
    {[...Array(20)].map((_, i) => (
      <div key={i} className="absolute animate-[fall_3s_ease-in-out_infinite]" 
           style={{ left: `${Math.random() * 100}%`, top: `-${Math.random() * 20}%`, backgroundColor: ['#FFD700', '#FF6347', '#4CAF50'][i%3], width: '10px', height: '10px', animationDelay: `${Math.random()}s` }} />
    ))}
  </div>
);

// --- UTILIDAD PUZZLE ---
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- PANTALLAS DE AUTENTICACIÓN (Login y Registro) ---
// (Se mantienen igual que la versión funcional anterior)

const RegisterScreen = ({ onRegister, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ familyName: '', adminName: '', email: '', password: '', seniorName: '', seniorPin: '', relationship: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert(`¡Registro Exitoso!\n\nEl CÓDIGO DE TU FAMILIA es: ${data.joinCode}\n\nAnótalo, el abuelo lo necesitará para entrar.`);
        onRegister(data.user);
      } else alert('Error: ' + data.message);
    } catch (err) { alert('Error de conexión'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-6 font-sans">
       <button onClick={onBack} className="self-start p-2 mb-4 text-slate-500 bg-white rounded-full shadow-sm"><ChevronLeft size={24} /></button>
       <div className="flex-1 max-w-md mx-auto w-full">
         <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Crear Cuenta</h2>
         <p className="text-slate-500 mb-6">Paso {step} de 2</p>
         <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
           {step === 1 ? (
             <div className="space-y-4 animate-in slide-in-from-right">
               <input required placeholder="Nombre Familia" value={formData.familyName} onChange={e => setFormData({...formData, familyName: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl" />
               <input required placeholder="Tu Nombre" value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl" />
               <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl" />
               <input required type="password" placeholder="Contraseña" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl" />
               <Button type="button" onClick={() => setStep(2)}>Siguiente <ArrowRight/></Button>
             </div>
           ) : (
             <div className="space-y-4 animate-in slide-in-from-right">
               <div className="bg-orange-50 p-3 rounded-xl text-sm text-orange-800 flex gap-2"><Star size={16}/> Configura acceso para el paciente.</div>
               <input required placeholder="Nombre del Paciente" value={formData.seniorName} onChange={e => setFormData({...formData, seniorName: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl" />
               <input required placeholder="Tu relación (ej. Nieta)" value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl" />
               <input required type="tel" maxLength="4" placeholder="PIN (4 dígitos)" value={formData.seniorPin} onChange={e => setFormData({...formData, seniorPin: e.target.value})} className="w-full p-4 bg-slate-50 rounded-xl text-center text-2xl font-bold tracking-widest" />
               <Button type="submit" disabled={loading} variant="primary" className="bg-emerald-600">{loading ? 'Registrando...' : 'Finalizar'}</Button>
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
  const [password, setPassword] = useState(''); 
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!val.trim()) { setErr(role === 'senior' ? 'Ingresa tu PIN' : 'Ingresa tu correo'); return; }
    if (role === 'senior' && !familyCode.trim()) { setErr('Ingresa el código de familia'); return; }
    if (role === 'family' && !password.trim()) { setErr('Ingresa tu contraseña'); return; }

    setLoading(true); setErr('');
    const payload = role === 'senior' ? { role, credential: val, familyCode } : { role, credential: val, password }; 

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        const cleanUser = {
            ...data.user,
            FamilyId: data.user.FamilyId || data.user.familyId,
            UserId: data.user.UserId || data.user.userId || data.user.id,
            Name: data.user.Name || data.user.name,
            Role: data.user.Role || data.user.role
        };
        onLogin(cleanUser);
      } else setErr(data.message || 'Credenciales incorrectas');
    } catch (error) { setErr('Error de conexión.'); } 
    finally { setLoading(false); }
  };

  const reset = () => { setRole(null); setVal(''); setFamilyCode(''); setPassword(''); setErr(''); };

  if (!role) return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl mx-auto"><Heart size={48} className="text-white fill-white"/></div>
      <h1 className="text-4xl font-black text-white mb-2">Memoria<span className="text-blue-400">Viva</span></h1>
      <p className="text-slate-400 mb-10">Conectando generaciones</p>
      <div className="w-full max-w-sm space-y-4">
        <button onClick={() => setRole('senior')} className="w-full bg-emerald-50 text-emerald-900 p-6 rounded-3xl flex items-center gap-4 hover:scale-105 transition-all shadow-xl"><User size={32} className="text-emerald-800"/> <span className="font-bold text-xl">Soy el Abuelo</span></button>
        <button onClick={() => setRole('family')} className="w-full bg-slate-800 text-white p-6 rounded-3xl flex items-center gap-4 border border-slate-700"><Users size={32} className="text-blue-400"/> <span className="font-bold text-xl">Soy Familiar</span></button>
      </div>
      <button onClick={onGoToRegister} className="mt-10 text-slate-400 text-sm flex gap-2 items-center"><UserPlus size={16}/> Crear cuenta</button>
    </div>
  );

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 transition-colors ${role === 'senior' ? 'bg-amber-50' : 'bg-slate-100'}`}>
      <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden p-8 space-y-6">
        <button onClick={reset} className="p-2 bg-slate-100 rounded-full"><ChevronLeft/></button>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-slate-800">{role === 'senior' ? 'Acceso Abuelo' : 'Bienvenido'}</h3>
          <p className="text-slate-500">{role === 'senior' ? 'Usa tu Código y PIN' : 'Ingresa tus datos'}</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          {role === 'senior' && (
            <div>
                <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Código de Familia</label>
                <input type="text" className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-lg font-mono uppercase focus:border-emerald-500" placeholder="Ej. FAM-8821" value={familyCode} onChange={e => setFamilyCode(e.target.value.toUpperCase())} />
            </div>
          )}
          <div>
            <label className="text-xs font-bold text-slate-400 ml-2 uppercase">{role === 'senior' ? 'PIN Personal' : 'Correo Electrónico'}</label>
            <input type={role === 'senior' ? "tel" : "email"} maxLength={role === 'senior' ? 4 : 50} className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-lg focus:border-blue-500" placeholder={role === 'senior' ? "••••" : "correo@ejemplo.com"} value={val} onChange={e => setVal(e.target.value)} />
          </div>
          {role === 'family' && (
             <div>
                <label className="text-xs font-bold text-slate-400 ml-2 uppercase">Contraseña</label>
                <input type="password" className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-lg focus:border-blue-500" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
          )}
          {err && <div className="text-red-500 text-center text-sm font-bold bg-red-50 p-3 rounded-xl">{err}</div>}
          <Button type="submit" disabled={loading} variant={role === 'senior' ? 'seniorPrimary' : 'primary'}>{loading ? 'Entrando...' : 'Entrar'}</Button>
        </form>
      </div>
    </div>
  );
};

// --- VISTA ABUELO (CON CRONÓMETRO Y UI MEJORADA) ---
const SeniorView = ({ user, memories, onUpdateMemory, onLogout, loading, error, refresh }) => {
  const [activeMemory, setActiveMemory] = useState(null);
  const [puzzleState, setPuzzleState] = useState({ pieces: [], solved: false, selected: null });
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(0); // NUEVO: Estado del cronómetro

  // Efecto para el cronómetro
  useEffect(() => {
    let interval;
    if (activeMemory && activeMemory.type === 'diary') {
      setTimer(0);
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeMemory]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const initPuzzle = () => {
    const pieces = [0, 1, 2, 3]; 
    setPuzzleState({ pieces: shuffleArray([...pieces]), solved: false, selected: null });
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
      if (isSolved) triggerSuccess();
    }
  };

  const triggerSuccess = () => {
    setTimeout(() => {
      setFeedback('correct');
      setTimeout(() => {
        onUpdateMemory(activeMemory.id, { completed: true });
        setFeedback(null); setActiveMemory(null);
      }, 3500);
    }, 500);
  };

  if (!activeMemory) {
    const userId = user.UserId || user.userId;
    const pending = memories.filter(m => 
        !m.completed && 
        (m.imageUrl) && 
        ((m.targetUserId || m.TargetUserId) === userId || m.targetUserId === null)
    );

    const displayName = (user.Name || user.name || "Abuelo").split(' ')[0];

    return (
      <div className="flex flex-col h-full bg-amber-50">
        <header className="bg-emerald-600 text-white p-6 rounded-b-[2rem] shadow-lg flex justify-between items-center sticky top-0 z-10">
          <div><h1 className="text-3xl font-bold">¡Hola, {displayName}! 👋</h1><p className="opacity-90">Tienes {pending.length} actividades</p></div>
          <div className="flex gap-2">
            <button onClick={refresh} className="bg-emerald-700 p-3 rounded-xl hover:bg-emerald-800 shadow-inner"><RefreshCw size={24}/></button>
            <button onClick={onLogout} className="bg-emerald-700 p-3 rounded-xl hover:bg-emerald-800 shadow-inner"><LogOut size={24}/></button>
          </div>
        </header>
        <main className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-r-xl mb-4">
                <p className="text-red-600 text-sm font-bold">{error}</p>
                <button onClick={refresh} className="mt-2 text-sm underline text-red-800">Reintentar</button>
            </div>
          )}
          {loading ? <div className="flex flex-col items-center justify-center mt-20 gap-4"><Loader className="animate-spin text-emerald-600" size={48}/><p className="text-slate-500">Cargando...</p></div> 
          : pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60"><Heart size={80} className="mb-4"/><p>¡Todo listo por hoy!</p></div>
          ) : pending.map(m => (
            <button key={m.id} onClick={() => { setActiveMemory(m); if(m.type === 'puzzle') initPuzzle(); }} 
              className="w-full bg-white p-5 rounded-3xl shadow-sm border-b-4 border-slate-200 flex items-center gap-5 active:scale-95 text-left">
              <img src={m.imageUrl || 'https://placehold.co/150?text=Sin+Foto'} className="w-24 h-24 rounded-2xl object-cover bg-slate-200" alt="thumb"/>
              <div className="flex-1"><h3 className="font-bold text-2xl text-slate-800">{m.title}</h3></div>
              <PlayCircle size={40} className="text-emerald-500"/>
            </button>
          ))}
        </main>
      </div>
    );
  }

  const ActivityShell = ({ children, title }) => (
    <div className="flex flex-col h-full bg-amber-50">
      <div className="p-4 flex items-center gap-4">
        <button onClick={() => setActiveMemory(null)} className="p-4 bg-white rounded-full shadow-md"><ChevronLeft size={28}/></button>
        <h2 className="font-bold text-2xl text-slate-800 leading-none">{title}</h2>
      </div>
      <div className="flex-1 p-4 flex flex-col items-center justify-center relative w-full h-full">{children}</div>
    </div>
  );

  if (feedback) return (
    <div className="flex flex-col h-full bg-emerald-600 items-center justify-center text-center p-8 animate-in zoom-in">
      <Confetti /><div className="bg-white p-8 rounded-full shadow-2xl mb-8"><CheckCircle size={80} className="text-emerald-600"/></div>
      <h2 className="text-4xl font-black text-white mb-4">¡Muy Bien!</h2>
      <p className="text-2xl text-emerald-100">"{activeMemory.familyMessage || 'Gracias por compartir esto.'}"</p>
    </div>
  );

  if (activeMemory.type === 'puzzle') return (
    <ActivityShell title="Ordena la foto">
      <div className="w-full max-w-[340px] aspect-square grid grid-cols-2 gap-2 p-3 bg-white rounded-2xl shadow-xl">
        {puzzleState.pieces.map((pieceVal, index) => {
          const x = (pieceVal % 2) * 100; const y = Math.floor(pieceVal / 2) * 100;
          return <button key={index} onClick={() => handlePieceClick(index)} className={`relative w-full h-full rounded-xl overflow-hidden border-2 ${puzzleState.selected === index ? 'border-blue-500 scale-95' : 'border-slate-100'}`} style={{backgroundImage: `url(${activeMemory.imageUrl})`, backgroundSize: '200% 200%', backgroundPosition: `${x}% ${y}%`}} />;
        })}
      </div>
    </ActivityShell>
  );

  if (activeMemory.type === 'quiz') {
    const options = activeMemory.options || ['1998', '2015', activeMemory.correctAnswer];
    return (
      <div className="flex flex-col h-full bg-amber-50">
        <div className="h-[40%] relative"><img src={activeMemory.imageUrl || 'https://placehold.co/500?text=Sin+Foto'} className="w-full h-full object-cover"/><button onClick={() => setActiveMemory(null)} className="absolute top-4 left-4 p-4 bg-white/90 rounded-full shadow-lg"><ChevronLeft size={28}/></button><div className="absolute inset-0 bg-black/40 flex items-end p-6"><h2 className="text-white text-3xl font-bold">{activeMemory.question}</h2></div></div>
        <div className="flex-1 bg-white -mt-8 rounded-t-[2.5rem] p-6 shadow-2xl relative z-10 flex flex-col justify-center gap-4">
          {options.map((opt, i) => (
            <Button key={i} variant="senior" onClick={() => { if(opt === activeMemory.correctAnswer) triggerSuccess(); else alert('Inténtalo de nuevo'); }}>{opt}</Button>
          ))}
        </div>
      </div>
    );
  }

  // --- VISTA DE DIARIO MEJORADA (CRONÓMETRO Y ESTILO) ---
  return (
    <ActivityShell title={activeMemory.title}>
      <div className="flex flex-col items-center justify-center w-full h-full gap-8">
        
        {/* Indicador de Grabación Animado */}
        <div className="relative">
            <div className="absolute inset-0 bg-red-200 rounded-full animate-ping opacity-75"></div>
            <div className="relative w-40 h-40 bg-red-100 rounded-full flex items-center justify-center text-red-500 border-4 border-white shadow-xl">
                <Mic size={64} />
            </div>
        </div>

        {/* Cronómetro */}
        <div className="text-center">
            <p className="text-4xl font-mono font-bold text-slate-700">{formatTime(timer)}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-500 font-bold tracking-widest text-sm">GRABANDO</span>
            </div>
        </div>

        <p className="text-2xl text-slate-800 text-center px-6 font-medium leading-relaxed">
            "{activeMemory.prompt}"
        </p>

        <div className="w-full px-6 mt-auto">
            <Button variant="seniorPrimary" onClick={triggerSuccess}>Terminar Grabación</Button>
        </div>
      </div>
    </ActivityShell>
  );
};

// --- VISTA FAMILIA ---
const FamilyView = ({ user, memories, notifications, onAddMemory, onLogout, loading }) => {
  const [tab, setTab] = useState('feed');
  const [formType, setFormType] = useState('quiz'); 
  const [file, setFile] = useState(null); 
  const [imgUrl, setImgUrl] = useState(''); 
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [msg, setMsg] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile); 
      const reader = new FileReader();
      reader.onloadend = () => setImgUrl(reader.result); 
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fId = user.FamilyId || user.familyId;
    const uId = user.UserId || user.userId;
    const isFileUpload = file !== null;

    const formData = new FormData();
    formData.append('familyId', fId);
    formData.append('creatorId', uId);
    formData.append('type', formType);
    formData.append('title', title);
    formData.append('familyMessage', msg);

    if (isFileUpload) {
      formData.append('imageFile', file); 
    } else {
      formData.append('imageUrl', 'https://placehold.co/500x300/CCCCCC/000000?text=Sin+Foto');
    }

    if (formType === 'quiz') {
      const options = ['1990', '2000', answer].sort(()=>Math.random()-0.5);
      formData.append('question', question);
      formData.append('correctAnswer', answer);
      formData.append('options', JSON.stringify(options)); 
    }
    if (formType === 'diary') {
      formData.append('prompt', question);
    }

    try {
        const res = await fetch(`${API_URL}/memories`, {
            method: 'POST', 
            body: formData 
        });
        const result = await res.json();
        if(result.success) {
            setTab('feed');
            onAddMemory({}); 
            setTitle(''); setQuestion(''); setAnswer(''); setMsg(''); setFile(null); setImgUrl('');
        } else {
            alert("Error al crear: " + (result.message || result.error));
        }
    } catch (err) { 
        alert("Error de conexión al subir la actividad."); 
    } 
    finally { setSubmitting(false); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans text-slate-800">
      <header className="bg-white px-6 py-4 shadow-sm flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">{user.Name?.[0] || user.name?.[0]}</div><div><p className="font-bold">{user.Name || user.name}</p><p className="text-xs text-slate-500">{user.RelationshipToSenior || user.relationshipToSenior}</p></div></div>
        <div className="flex gap-4 items-center">
            <div className="relative"><Bell size={24} className="text-slate-400" />{notifications.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full text-[10px] flex items-center justify-center animate-bounce">{notifications.length}</span>}</div>
            <button onClick={onLogout}><LogOut size={24} className="text-slate-400"/></button>
        </div>
      </header>

      <div className="px-6 py-4 sticky top-[72px] z-10 bg-slate-50/95 backdrop-blur-sm">
        <div className="bg-white p-1.5 rounded-2xl flex shadow-sm border border-slate-100">
          <button onClick={() => setTab('feed')} className={`flex-1 py-3 text-sm font-bold rounded-xl ${tab === 'feed' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Actividad</button>
          <button onClick={() => setTab('add')} className={`flex-1 py-3 text-sm font-bold rounded-xl ${tab === 'add' ? 'bg-slate-900 text-white' : 'text-slate-400'}`}>Crear +</button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-6 pb-6">
        {tab === 'feed' ? (
          <div className="space-y-6 animate-in slide-in-from-left">
             {notifications.length > 0 && (
                <div className="mb-6"><h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Notificaciones</h3>
                    <div className="space-y-2">{notifications.map(n => (<div key={n.id} className="bg-white border-l-4 border-emerald-500 p-4 rounded-xl shadow-sm flex gap-3"><CheckCircle size={16} className="text-emerald-600"/><p className="font-bold text-sm">{n.text}</p></div>))}</div>
                </div>
            )}
            <h3 className="text-xs font-bold text-slate-400 uppercase">Historial</h3>
            {loading ? <Loader className="animate-spin mx-auto"/> : memories.map(m => (
               <div key={m.id} className={`bg-white p-4 rounded-2xl border flex gap-4 items-center ${m.completed ? 'border-emerald-200 opacity-100' : 'border-slate-100 opacity-60'}`}>
                   <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">{m.type === 'puzzle' ? <Grid size={20}/> : <MessageCircle size={20}/>}</div>
                   <div><p className="text-sm font-bold">{m.title}</p><p className="text-xs text-slate-500">{m.completed ? 'Completado' : 'Pendiente'}</p></div>
               </div>
            ))}
          </div>
        ) : (
          <form onSubmit={handleAdd} className="space-y-6 animate-in slide-in-from-right">
            <div className="grid grid-cols-3 gap-3">
              {['quiz', 'puzzle', 'diary'].map(t => (
                <button type="button" key={t} onClick={() => setFormType(t)} className={`p-4 rounded-2xl border-2 capitalize font-bold text-xs ${formType === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100'}`}>{t}</button>
              ))}
            </div>
            <div className="space-y-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
               <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl" placeholder="Título"/>
               <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer relative overflow-hidden">
                   <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                   {imgUrl ? <img src={imgUrl} className="absolute inset-0 w-full h-full object-cover opacity-50"/> : <Upload className="text-slate-400"/>}
                   <span className="relative z-10 text-sm font-bold text-slate-500">{imgUrl ? 'Cambiar Foto' : 'Subir Foto'}</span>
               </div>
               {formType === 'quiz' && <><input required value={question} onChange={e => setQuestion(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl" placeholder="Pregunta"/><input required value={answer} onChange={e => setAnswer(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl" placeholder="Respuesta Correcta"/></>}
               {formType === 'diary' && <input required value={question} onChange={e => setQuestion(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl" placeholder="Tema a narrar"/>}
               <input required value={msg} onChange={e => setMsg(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl" placeholder="Mensaje de felicitación"/>
            </div>
            <Button type="submit" disabled={submitting}>{submitting ? 'Guardando...' : 'Publicar'}</Button>
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
  const [memories, setMemories] = useState([]);
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const fetchMemories = async (familyId) => {
    if(!familyId) return;
    setLoadingMemories(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_URL}/memories/${familyId}`);
      if(!res.ok) throw new Error('Error del servidor (' + res.status + ')');
      const data = await res.json();
      if(Array.isArray(data)) setMemories(data);
    } catch (err) { 
      setErrorMsg('No se pudieron descargar las actividades. Revisa tu conexión.');
      console.error("Fetch Error:", err); 
    } finally { setLoadingMemories(false); }
  };

  const fetchNotifications = async (familyId) => {
      try {
          const res = await fetch(`${API_URL}/notifications/${familyId}`);
          const data = await res.json();
          if(Array.isArray(data)) setNotifications(data);
      } catch (err) { console.error(err); }
  }

  const handleLogin = (u) => { 
    setUser(u); 
    setRegistering(false); 
    const fId = u.FamilyId || u.familyId;
    if(fId) { 
      fetchMemories(fId); 
      fetchNotifications(fId); 
    } 
  };

  const handleUpdate = async (id, changes) => {
    setMemories(prev => prev.map(m => m.id === id ? {...m, ...changes} : m));
    if (changes.completed) await fetch(`${API_URL}/memories/${id}/complete`, { method: 'PATCH' });
  };

  const handleAdd = (payload) => {
      const fId = user.FamilyId || user.familyId;
      if(fId) fetchMemories(fId);
  };

  if (registering) return <RegisterScreen onRegister={handleLogin} onBack={() => setRegistering(false)}/>;
  if (!user) return <LoginScreen onLogin={handleLogin} onGoToRegister={() => setRegistering(true)}/>;

  return (
    <div className="w-full h-screen max-w-md mx-auto bg-slate-50 shadow-2xl overflow-hidden font-sans">
      {user.Role === 'senior' || user.role === 'senior' ? (
        <SeniorView 
          user={user} 
          memories={memories} 
          onUpdateMemory={handleUpdate} 
          onLogout={() => setUser(null)} 
          loading={loadingMemories} 
          error={errorMsg}
          refresh={() => fetchMemories(user.FamilyId || user.familyId)}
        />
      ) : (
        <FamilyView user={user} memories={memories} notifications={notifications} onAddMemory={handleAdd} onLogout={() => setUser(null)} loading={loadingMemories}/>
      )}
    </div>
  );
}