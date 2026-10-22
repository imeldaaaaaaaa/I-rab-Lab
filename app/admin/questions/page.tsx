"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, Pencil, Save, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Question = { id:string; title:string; sentence:string; translation:string|null; analyses: unknown; difficulty:string; source_pages:string|null; status:"draft"|"published"; created_at:string };
const exampleAnalyses = [
  { word:"كَتَبَ", role:"فعل ماضٍ", irob:"مبني على الفتح", sign:"الفتحة", reason:"Fi‘il māḍī yang menunjukkan perbuatan lampau." },
  { word:"الْمُعَلِّمُ", role:"فاعل", irob:"مرفوع", sign:"الضمة", reason:"Isim yang menjadi pelaku dari fi‘il كَتَبَ." },
  { word:"الدَّرْسَ", role:"مفعول به", irob:"منصوب", sign:"الفتحة", reason:"Isim yang menjadi objek dari perbuatan menulis." }
];
const blank = {title:"Latihan fā‘il dan maf‘ūl bih",sentence:"كَتَبَ الْمُعَلِّمُ الدَّرْسَ",translation:"Guru menulis pelajaran.",difficulty:"Dasar",source_pages:"",status:"draft" as "draft"|"published",analyses:JSON.stringify(exampleAnalyses,null,2)};

export default function AdminQuestionsPage() {
  const router = useRouter();
  const [items,setItems] = useState<Question[]>([]);
  const [form,setForm] = useState(blank);
  const [editing,setEditing] = useState<string|null>(null);
  const [error,setError] = useState("");
  const [message,setMessage] = useState("");
  const [loading,setLoading] = useState(true);

  async function load() {
    if (!supabase) { setError("Supabase belum dikonfigurasi."); setLoading(false); return; }
    const {data:{user}} = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }
    const {data:profile} = await supabase.from("profiles").select("role").eq("id",user.id).single();
    if (profile?.role !== "admin") { setError("Halaman ini khusus admin."); setLoading(false); return; }
    const {data,error:e} = await supabase.from("questions").select("*").order("created_at",{ascending:false});
    if (e) setError(e.message); else setItems((data||[]) as Question[]);
    setLoading(false);
  }
  useEffect(()=>{load();},[]);
  function update<K extends keyof typeof blank>(key:K,value:(typeof blank)[K]) { setForm(old=>({...old,[key]:value})); }

  async function save(e:FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    if (!supabase) return;
    let parsed: unknown;
    try { parsed=JSON.parse(form.analyses); if (!Array.isArray(parsed) || parsed.length===0) throw new Error("Analisis harus berupa array JSON yang berisi minimal satu objek kata."); }
    catch (e) { setError(e instanceof Error ? `Format analisis tidak valid: ${e.message}` : "Format JSON tidak valid."); return; }
    const {data:{user}}=await supabase.auth.getUser();
    if (!user) { setError("Silakan login kembali."); return; }
    const payload={title:form.title,sentence:form.sentence,translation:form.translation,analyses:parsed,difficulty:form.difficulty,source_pages:form.source_pages || null,status:form.status,created_by:user.id};
    const result=editing ? await supabase.from("questions").update({...payload}).eq("id",editing) : await supabase.from("questions").insert(payload);
    if(result.error){setError(result.error.message);return;}
    setMessage(editing?"Soal berhasil diperbarui.":"Soal berhasil ditambahkan.");
    setForm(blank);setEditing(null);await load();
  }
  function edit(item:Question) {
    setEditing(item.id);
    setForm({title:item.title,sentence:item.sentence,translation:item.translation||"",difficulty:item.difficulty,source_pages:item.source_pages||"",status:item.status,analyses:JSON.stringify(item.analyses,null,2)});
    window.scrollTo({top:0,behavior:"smooth"});
  }
  async function remove(id:string) {
    if(!supabase||!window.confirm("Hapus soal ini? Riwayat percobaan terkait perlu dipertimbangkan."))return;
    const {error:e}=await supabase.from("questions").delete().eq("id",id);
    if(e)setError(e.message);else{setMessage("Soal dihapus.");await load();}
  }

  return <div className="app-shell">
    <aside className="sidebar"><Link href="/" className="brand"><span className="brand-mark">ب</span><span>Bedah I‘rob</span></Link><div className="sidebar-label">Admin</div><nav className="side-nav"><Link className="side-link" href="/dashboard"><ArrowLeft size={17}/> Dashboard</Link><Link className="side-link" href="/admin/materials">Materi</Link><Link className="side-link active" href="/admin/questions"><ClipboardList size={17}/> Bank soal</Link><Link className="side-link" href="/admin/import">Impor konten</Link></nav></aside>
    <main className="main-area">
      <header className="topbar"><div><h1>Bank Soal I‘rob</h1><div className="muted">Setiap kalimat memiliki analisis untuk tiap kata.</div></div><span className="badge">Admin</span></header>
      {error&&<div className="notice error">{error}</div>}{message&&<div className="notice success">{message}</div>}
      <section className="panel">
        <div className="panel-header"><div><h2>{editing?"Edit latihan":"Tambah latihan"}</h2><p>Analisis disimpan sebagai JSON agar setiap kata punya kedudukan, tanda, dan alasan.</p></div></div>
        <form onSubmit={save}>
          <div className="form-field"><label>Judul latihan</label><input className="input" value={form.title} onChange={e=>update("title",e.target.value)} required/></div>
          <div className="form-field"><label>Kalimat Arab</label><textarea className="textarea" dir="rtl" style={{fontSize:24}} rows={2} value={form.sentence} onChange={e=>update("sentence",e.target.value)} required/></div>
          <div className="form-field"><label>Terjemahan (opsional)</label><input className="input" value={form.translation} onChange={e=>update("translation",e.target.value)}/></div>
          <div className="grid-two"><div className="form-field"><label>Tingkat kesulitan</label><select className="select" value={form.difficulty} onChange={e=>update("difficulty",e.target.value)}><option>Dasar</option><option>Menengah</option><option>Lanjutan</option></select></div><div className="form-field"><label>Status</label><select className="select" value={form.status} onChange={e=>update("status",e.target.value as "draft"|"published")}><option value="draft">Draft</option><option value="published">Publikasikan</option></select></div></div>
          <div className="form-field"><label>Rujukan sumber / halaman</label><input className="input" value={form.source_pages} onChange={e=>update("source_pages",e.target.value)} placeholder="Contoh: Landasan kaidah hlm. 7–8; contoh latihan baru"/></div>
          <div className="form-field"><label>Analisis semua kata (JSON)</label><textarea className="textarea" style={{fontFamily:"Consolas, monospace",fontSize:12,minHeight:260}} value={form.analyses} onChange={e=>update("analyses",e.target.value)} required/><small className="muted">Setiap objek memuat word, role, irob, sign, dan reason. Gunakan contoh format di atas sebagai pola.</small></div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><button className="btn"><Save size={16}/>{editing?"Simpan perubahan":"Simpan soal"}</button><button type="button" className="btn btn-secondary" onClick={()=>{setForm(blank);setEditing(null);}}>Reset</button></div>
        </form>
      </section>
      <section className="panel">
        <div className="panel-header"><div><h2>Soal tersimpan</h2><p>{items.length} latihan.</p></div></div>
        {loading?<div className="empty">Memuat data...</div>:items.length===0?<div className="empty">Belum ada soal. Tambahkan latihan pertama.</div>:<div className="table-wrap"><table><thead><tr><th>Latihan</th><th>Kalimat</th><th>Level</th><th>Referensi</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><strong>{item.title}</strong></td><td dir="rtl" style={{fontSize:18}}>{item.sentence}</td><td>{item.difficulty}</td><td>{item.source_pages || "—"}</td><td><span className={`badge ${item.status==="draft"?"draft":""}`}>{item.status}</span></td><td><div style={{display:"flex",gap:6}}><button className="btn btn-secondary btn-small" onClick={()=>edit(item)}><Pencil size={13}/> Edit</button><button className="btn btn-secondary btn-small" onClick={()=>remove(item.id)}><Trash2 size={13}/></button></div></td></tr>)}</tbody></table></div>}
      </section>
    </main>
  </div>;
}
