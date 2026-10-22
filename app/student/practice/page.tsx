"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpenCheck, CheckCircle2, Send } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Analysis = { word:string; role:string; irob:string; sign:string; reason:string };
type Question = { id:string; title:string; sentence:string; translation:string|null; analyses:Analysis[]; difficulty:string };

export default function StudentPracticePage() {
  const router=useRouter();
  const [questions,setQuestions]=useState<Question[]>([]);
  const [selectedId,setSelectedId]=useState("");
  const [selectedIndex,setSelectedIndex]=useState(0);
  const [answers,setAnswers]=useState<Record<number,{role:string;irob:string;sign:string;reason:string}>>({});
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [feedback,setFeedback]=useState("");
  const [loading,setLoading]=useState(true);

  async function load() {
    if(!supabase){setError("Supabase belum dikonfigurasi.");setLoading(false);return;}
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.replace("/login");return;}
    const {data,error:e}=await supabase.from("questions").select("id,title,sentence,translation,analyses,difficulty").eq("status","published").order("created_at",{ascending:false});
    if(e)setError(e.message);else {
      const rows=(data||[]) as Question[];
      setQuestions(rows);
      if(rows.length) setSelectedId(rows[0].id);
    }
    setLoading(false);
  }
  useEffect(()=>{load();},[]);

  const question=questions.find(q=>q.id===selectedId);
  const analyses=useMemo(()=>question?.analyses||[],[question]);
  const current=analyses[selectedIndex];
  const currentAnswer=answers[selectedIndex]||{role:"",irob:"",sign:"",reason:""};

  function updateAnswer(key:"role"|"irob"|"sign"|"reason",value:string) {
    setAnswers(old=>({...old,[selectedIndex]:{...(old[selectedIndex]||{role:"",irob:"",sign:"",reason:""}),[key]:value}}));
  }

  function changeQuestion(id:string) {
    setSelectedId(id);setSelectedIndex(0);setAnswers({});setMessage("");setFeedback("");
  }

  async function submit() {
    setError("");setMessage("");setFeedback("");
    if(!supabase||!question)return;
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){setError("Silakan login kembali.");return;}
    const answerList=analyses.map((a,i)=>({word:a.word,answer:answers[i]||{role:"",irob:"",sign:"",reason:""}}));
    const score=analyses.length ? Math.round(analyses.reduce((sum,a,i)=>{
      const ans=answers[i]; if(!ans)return sum;
      const role=ans.role.trim().toLowerCase()===a.role.trim().toLowerCase()?1:0;
      const irob=ans.irob.trim().toLowerCase()===a.irob.trim().toLowerCase()?1:0;
      const sign=ans.sign.trim().toLowerCase()===a.sign.trim().toLowerCase()?1:0;
      return sum+(role+irob+sign)/3;
    },0)/analyses.length*100):0;
    const {error:e}=await supabase.from("attempts").insert({student_id:user.id,question_id:question.id,answers:answerList,score,feedback:null});
    if(e){setError(e.message);return;}
    setMessage(`Jawaban tersimpan. Skor otomatis sementara: ${score}/100. Periksa pembahasan untuk membandingkan analisis.`);
    setFeedback("Catatan: penilaian awal membandingkan jawaban teks secara sederhana. Untuk jawaban uraian dan variasi analisis yang sah, penilaian perlu ditinjau pengajar.");
  }

  return <div className="app-shell">
    <aside className="sidebar"><Link href="/" className="brand"><span className="brand-mark">ب</span><span>Bedah I‘rob</span></Link><div className="sidebar-label">Siswa</div><nav className="side-nav"><Link className="side-link" href="/dashboard"><ArrowLeft size={17}/> Dashboard</Link><Link className="side-link active" href="/student/practice"><BookOpenCheck size={17}/> Latihan i‘rob</Link><Link className="side-link" href="/student/classes">Kelas saya</Link></nav><div className="sidebar-bottom">Baca kalimatnya. Pilih kata. Jelaskan i‘rob-nya.</div></aside>
    <main className="main-area">
      <header className="topbar"><div><h1>Laboratorium Bedah I‘rob</h1><div className="muted">Analisis kalimat secara utuh, kata demi kata.</div></div><span className="badge">Latihan</span></header>
      {error&&<div className="notice error">{error}</div>}{message&&<div className="notice success">{message}</div>}{feedback&&<div className="notice">{feedback}</div>}
      <section className="panel">
        <div className="panel-header"><div><h2>Pilih latihan</h2><p>Latihan yang sudah dipublikasikan admin.</p></div></div>
        {loading?<div className="empty">Memuat latihan...</div>:questions.length===0?<div className="empty">Belum ada latihan yang dipublikasikan. Admin perlu menambahkan soal terlebih dahulu.</div>:<select className="select" value={selectedId} onChange={e=>changeQuestion(e.target.value)}>{questions.map(q=><option value={q.id} key={q.id}>{q.title} · {q.difficulty}</option>)}</select>}
      </section>
      {question&&<section className="panel">
        <div className="panel-header"><div><h2>{question.title}</h2><p>{question.difficulty} · Analisis semua kata dalam kalimat.</p></div><span className="badge">{selectedIndex+1}/{analyses.length} kata</span></div>
        <div className="exercise-sentence" dir="rtl">{analyses.map((a,i)=><button key={`${a.word}-${i}`} className={`exercise-word ${i===selectedIndex?"selected":""}`} onClick={()=>setSelectedIndex(i)}>{a.word}</button>)}</div>
        {question.translation&&<p className="muted" style={{textAlign:"center"}}>{question.translation}</p>}
        {current&&<div className="panel" style={{background:"#f9faf5",marginTop:18}}>
          <div className="panel-header"><div><h2>Kata yang dianalisis</h2><p>Lengkapi kedudukan dan alasan gramatikalnya.</p></div></div>
          <div className="arabic-sentence" style={{fontSize:34}}>{current.word}</div>
          <div className="grid-two">
            <div className="form-field"><label>Kedudukan / fungsi kata</label><input className="input" value={currentAnswer.role} onChange={e=>updateAnswer("role",e.target.value)} placeholder="Contoh: فاعل"/></div>
            <div className="form-field"><label>Status i‘rob</label><input className="input" value={currentAnswer.irob} onChange={e=>updateAnswer("irob",e.target.value)} placeholder="Contoh: مرفوع"/></div>
            <div className="form-field"><label>Tanda i‘rob / bentuk</label><input className="input" value={currentAnswer.sign} onChange={e=>updateAnswer("sign",e.target.value)} placeholder="Contoh: الضمة"/></div>
            <div className="form-field"><label>Alasan gramatikal</label><textarea className="textarea" rows={3} value={currentAnswer.reason} onChange={e=>updateAnswer("reason",e.target.value)} placeholder="Jelaskan mengapa kata ini berkedudukan demikian."/></div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"space-between",flexWrap:"wrap"}}>
            <button className="btn btn-secondary" disabled={selectedIndex===0} onClick={()=>setSelectedIndex(i=>i-1)}>Kata sebelumnya</button>
            <button className="btn btn-secondary" disabled={selectedIndex===analyses.length-1} onClick={()=>setSelectedIndex(i=>i+1)}>Kata berikutnya</button>
          </div>
        </div>}
        <div className="panel-header" style={{marginTop:20}}><div><h2>Progres analisis</h2><p>{Object.keys(answers).filter(k=>answers[Number(k)]?.role&&answers[Number(k)]?.reason).length} dari {analyses.length} kata sudah diisi.</p></div></div>
        <div className="progress-track"><div className="progress-fill" style={{width:`${analyses.length?Object.keys(answers).filter(k=>answers[Number(k)]?.role&&answers[Number(k)]?.reason).length/analyses.length*100:0}%`}}/></div>
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:20}}><button className="btn" onClick={submit}><Send size={15}/> Kirim analisis</button></div>
        <div className="notice" style={{marginTop:18}}>Setelah mengirim, cocokkan hasil analisismu dengan pembahasan yang disediakan guru/admin. Pada versi awal ini, sistem menyimpan jawaban dan memberi skor teks sederhana; validasi akademik tetap perlu dilakukan.</div>
        <details style={{marginTop:14}}><summary style={{cursor:"pointer",fontWeight:700,color:"var(--ink)"}}>Lihat pembahasan referensi</summary><div style={{marginTop:12}}>{analyses.map((a,i)=><div className="analysis-row" key={`${a.word}-explain-${i}`}><div><strong dir="rtl" style={{fontSize:20}}>{a.word}</strong><div className="muted">{a.role} · {a.irob} · {a.sign}</div></div><div className="muted">{a.reason}</div></div>)}</div></details>
      </section>}
    </main>
  </div>;
}
