"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Eye, GraduationCap, Send } from "lucide-react";
import PublicNav from "@/components/public-nav";
import { demoQuestions, type Analysis, type Question } from "@/lib/content";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type StudentAnswer = { role: string; irob: string; sign: string; reason: string };
const emptyAnswer = (): StudentAnswer => ({ role: "", irob: "", sign: "", reason: "" });

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/\s+/g, " ").trim();
}
function isUuid(value: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }

export default function PracticeWorkspace({ slug }: { slug: string }) {
  const seed = demoQuestions.find((item) => item.slug === slug) || null;
  const [question, setQuestion] = useState<Question | null>(isSupabaseConfigured ? null : seed);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState("");
  const [answers, setAnswers] = useState<Record<number, StudentAnswer>>({});
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const analyses = useMemo(() => question?.analyses || [], [question]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { setQuestion(seed); setLoading(false); return; }
      let query = supabase.from("questions").select("id,slug,title,sentence,translation,analyses,difficulty,source_pages,status").eq("status", "published");
      let result = await query.eq("slug", slug).maybeSingle();
      if (!result.data && isUuid(slug)) result = await supabase.from("questions").select("id,slug,title,sentence,translation,analyses,difficulty,source_pages,status").eq("id", slug).eq("status", "published").maybeSingle();
      if (!active) return;
      if (result.error) setLoadError("Latihan belum bisa dimuat. Periksa konfigurasi database.");
      else setQuestion((result.data as Question | null) || null);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [slug, seed]);

  function updateAnswer(index: number, key: keyof StudentAnswer, value: string) {
    setAnswers((old) => ({ ...old, [index]: { ...(old[index] || emptyAnswer()), [key]: value } }));
    setSubmitted(false); setMessage(""); setScore(null);
  }

  async function submit() {
    if (!question) return;
    const computed = analyses.length ? Math.round(analyses.reduce((total, analysis, index) => {
      const answer = answers[index] || emptyAnswer();
      const points = ["role", "irob", "sign"].reduce((sum, key) => sum + (normalize(answer[key as keyof StudentAnswer]) === normalize(analysis[key as keyof Analysis] as string) ? 1 : 0), 0);
      return total + points / 3;
    }, 0) / analyses.length * 100) : 0;
    setScore(computed); setSubmitted(true); setMessage("Pembahasan sudah terbuka. Cocokkan jawaban dan alasanmu dengan kunci yang disediakan.");

    const questionId = question.id;
    if (!supabase || !questionId || !isUuid(questionId)) {
      setMessage("Mode pengunjung/demo: jawaban hanya dipakai di halaman ini dan tidak disimpan. Jika halaman dimuat ulang, isian akan hilang.");
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMessage("Mode pengunjung: jawaban tidak disimpan. Login sebagai siswa jika ingin menyimpan progres.");
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (profile?.role !== "student") {
        setMessage("Pembahasan terbuka. Hanya akun siswa yang menyimpan hasil latihan ke riwayat belajar.");
        return;
      }
      const answerList = analyses.map((analysis, index) => ({ word: analysis.word, answer: answers[index] || emptyAnswer() }));
      const { error } = await supabase.from("attempts").insert({ student_id: user.id, question_id: questionId, answers: answerList, score: computed, feedback: "Skor awal membandingkan teks kedudukan, status i‘rab, dan tanda. Alasan perlu ditinjau berdasarkan kaidah dan variasi jawaban yang sah." });
      if (error) setMessage("Jawaban diperiksa, tetapi belum tersimpan. Pastikan skema database dan hak akses sudah dipasang.");
      else setMessage(`Jawaban tersimpan ke riwayat siswa. Skor kecocokan dasar: ${computed}/100; alasan gramatikal tetap perlu ditinjau.`);
    } catch {
      setMessage("Pembahasan terbuka, tetapi penyimpanan riwayat belum berhasil. Periksa koneksi database.");
    }
  }

  return <main><div className="container"><PublicNav /><section className="section" style={{paddingTop:12,maxWidth:920,margin:"0 auto"}}>
    <Link href="/latihan" className="side-link" style={{display:"inline-flex",paddingLeft:0}}><ArrowLeft size={16}/> Semua latihan</Link>
    {loading ? <div className="empty">Memuat latihan...</div> : loadError ? <div className="notice error">{loadError}</div> : !question ? <div className="panel empty">Latihan tidak ditemukan atau belum dipublikasikan.</div> : <>
      <span className="eyebrow"><GraduationCap size={14}/> {question.difficulty || "Dasar"} · Mode belajar terbuka</span>
      <h1 style={{fontSize:"clamp(30px,5vw,44px)",lineHeight:1.1,letterSpacing:"-.04em",color:"var(--ink)",margin:"18px 0 10px"}}>{question.title}</h1>
      <p className="muted">Analisis semua kata. Isikan kedudukan, status i‘rab atau bina’, tanda/bentuk akhir, dan alasan gramatikalnya.</p>
      <section className="panel" style={{marginTop:22}}>
        <div className="exercise-sentence" dir="rtl">{question.sentence || analyses.map((a) => a.word).join(" ")}</div>
        {question.translation && <p className="muted" style={{textAlign:"center"}}>{question.translation}</p>}
        <div className="notice">Mode pengunjung tidak menyimpan hasil. Setelah mengirim jawaban, pembahasan akan terbuka hanya untuk sesi halaman ini.</div>
        {analyses.map((analysis, index) => {
          const answer = answers[index] || emptyAnswer();
          return <div className="panel" key={`${analysis.word}-${index}`} style={{background:"#fbfcf8",marginTop:14}}>
            <div className="panel-header"><div><h2>Kata {index + 1} dari {analyses.length}</h2><p>Isi analisis kata berikut.</p></div><span className="badge">{index + 1}/{analyses.length}</span></div>
            <div className="arabic-sentence" style={{fontSize:32}} dir="rtl">{analysis.word}</div>
            <div className="grid-two">
              <div className="form-field"><label>Kedudukan / fungsi kata</label><input className="input" value={answer.role} onChange={(e) => updateAnswer(index, "role", e.target.value)} placeholder="Contoh: فاعل" /></div>
              <div className="form-field"><label>Status i‘rab / bina’</label><input className="input" value={answer.irob} onChange={(e) => updateAnswer(index, "irob", e.target.value)} placeholder="Contoh: مرفوع / مبني" /></div>
              <div className="form-field"><label>Tanda i‘rab / bentuk akhir</label><input className="input" value={answer.sign} onChange={(e) => updateAnswer(index, "sign", e.target.value)} placeholder="Contoh: الضمة الظاهرة" /></div>
              <div className="form-field"><label>Alasan gramatikal</label><textarea className="textarea" rows={3} value={answer.reason} onChange={(e) => updateAnswer(index, "reason", e.target.value)} placeholder="Jelaskan alasan berdasarkan kaidah nahwu..." /></div>
            </div>
            {submitted && <div className="notice success"><strong>Kunci pembahasan</strong><div dir="rtl" style={{fontSize:21,margin:"8px 0"}}>{analysis.word}</div><p><strong>Kedudukan:</strong> {analysis.role}</p><p><strong>Status:</strong> {analysis.irob}</p><p><strong>Tanda/bentuk:</strong> {analysis.sign}</p><p><strong>Alasan:</strong> {analysis.reason}</p></div>}
          </div>;
        })}
        {submitted && <div className="panel" style={{background:"#f5f8f1"}}><div style={{display:"flex",gap:10,alignItems:"center"}}><CheckCircle2 color="#367b6c"/><div><strong>Hasil pemeriksaan dasar: {score}/100</strong><div className="muted">Skor hanya membandingkan teks kedudukan, status, dan tanda. Alasan uraian tidak dinilai otomatis.</div></div></div></div>}
        {message && <div className="notice">{message}</div>}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:18}}>
          <button className="btn" onClick={submit}><Send size={15}/> Periksa jawaban & buka pembahasan</button>
          {submitted && <button className="btn btn-secondary" onClick={() => {setAnswers({});setSubmitted(false);setScore(null);setMessage("");}}><Eye size={15}/> Coba ulang</button>}
          <Link className="btn btn-secondary" href="/login">Masuk untuk menyimpan progres</Link>
        </div>
      </section>
      <div className="muted" style={{fontSize:12}}>Rujukan latihan: {question.source_pages || "Lihat materi terkait"}. Contoh kalimat disusun untuk latihan; periksa pembahasan dengan kaidah sumber sebelum digunakan sebagai penilaian resmi.</div>
    </>}
  </section><footer className="footer">Belajar mandiri terbuka untuk semua · Bedah I‘rob</footer></div></main>;
}
