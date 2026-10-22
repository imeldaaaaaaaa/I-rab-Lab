"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type Material = { id: string; title: string; level: string; content: string; source_title: string | null; source_author: string | null; source_pages: string | null; status: "draft" | "published"; created_at: string };

const blank = { title:"", level:"Dasar", content:"", source_title:"", source_author:"", source_pages:"", status:"draft" as "draft" | "published" };

export default function AdminMaterialsPage() {
  const router = useRouter();
  const [items, setItems] = useState<Material[]>([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!supabase) { setError("Supabase belum dikonfigurasi. Isi .env.local terlebih dahulu."); setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace("/login"); return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") { setError("Halaman ini khusus admin."); setLoading(false); return; }
    const { data, error: e } = await supabase.from("materials").select("*").order("created_at", { ascending:false });
    if (e) setError(e.message); else setItems((data || []) as Material[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function change<K extends keyof typeof blank>(key: K, value: (typeof blank)[K]) { setForm(old => ({...old, [key]:value})); }

  async function save(e: FormEvent) {
    e.preventDefault(); setError(""); setMessage("");
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Silakan login kembali."); return; }
    const payload = { ...form, slug: form.title.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") + "-" + Date.now().toString().slice(-5), created_by:user.id };
    const result = editing
      ? await supabase.from("materials").update({...form, updated_at:new Date().toISOString()}).eq("id", editing)
      : await supabase.from("materials").insert(payload);
    if (result.error) { setError(result.error.message); return; }
    setMessage(editing ? "Materi berhasil diperbarui." : "Materi berhasil ditambahkan.");
    setForm(blank); setEditing(null); await load();
  }

  function edit(item: Material) {
    setEditing(item.id);
    setForm({title:item.title, level:item.level, content:item.content, source_title:item.source_title || "", source_author:item.source_author || "", source_pages:item.source_pages || "", status:item.status});
    window.scrollTo({top:0,behavior:"smooth"});
  }

  async function remove(id: string) {
    if (!supabase || !window.confirm("Hapus materi ini? Pastikan materi belum dibutuhkan oleh riwayat siswa.")) return;
    const { error:e } = await supabase.from("materials").delete().eq("id",id);
    if (e) setError(e.message); else { setMessage("Materi dihapus."); await load(); }
  }

  return <div className="app-shell">
    <aside className="sidebar"><Link href="/" className="brand"><span className="brand-mark">ب</span><span>Bedah I‘rob</span></Link><div className="sidebar-label">Admin</div><nav className="side-nav"><Link className="side-link" href="/dashboard"><ArrowLeft size={17}/> Dashboard</Link><Link className="side-link active" href="/admin/materials"><BookOpen size={17}/> Kelola materi</Link><Link className="side-link" href="/admin/questions"><Pencil size={17}/> Bank soal</Link><Link className="side-link" href="/admin/import">Impor konten</Link></nav><div className="sidebar-bottom">Materi yang diterbitkan harus mencantumkan sumber yang jelas.</div></aside>
    <main className="main-area">
      <header className="topbar"><div><h1>Kelola Materi</h1><div className="muted">Tambahkan materi yang sudah dikembangkan dan divalidasi.</div></div><span className="badge">Admin</span></header>
      {error && <div className="notice error">{error}</div>}{message && <div className="notice success">{message}</div>}
      <section className="panel">
        <div className="panel-header"><div><h2>{editing ? "Edit materi" : "Tambah materi baru"}</h2><p>Isi konten dan sumber referensi sebelum dipublikasikan.</p></div></div>
        <form onSubmit={save}>
          <div className="grid-two">
            <div className="form-field"><label>Judul materi</label><input className="input" value={form.title} onChange={e=>change("title",e.target.value)} required placeholder="Contoh: Pengertian Fā‘il"/></div>
            <div className="form-field"><label>Tingkat</label><select className="select" value={form.level} onChange={e=>change("level",e.target.value)}><option>Dasar</option><option>Menengah</option><option>Lanjutan</option></select></div>
          </div>
          <div className="form-field"><label>Isi materi</label><textarea className="textarea" value={form.content} onChange={e=>change("content",e.target.value)} required rows={7} placeholder="Tulis penjelasan, contoh, rangkuman, dan tujuan belajar..."/></div>
          <div className="grid-two">
            <div className="form-field"><label>Nama kitab / buku</label><input className="input" value={form.source_title} onChange={e=>change("source_title",e.target.value)} placeholder="Nama sumber"/></div>
            <div className="form-field"><label>Penulis</label><input className="input" value={form.source_author} onChange={e=>change("source_author",e.target.value)} placeholder="Nama penulis"/></div>
          </div>
          <div className="grid-two">
            <div className="form-field"><label>Edisi / halaman</label><input className="input" value={form.source_pages} onChange={e=>change("source_pages",e.target.value)} placeholder="Contoh: cetakan 2, hlm. 15–18"/></div>
            <div className="form-field"><label>Status</label><select className="select" value={form.status} onChange={e=>change("status",e.target.value as "draft" | "published")}><option value="draft">Draft</option><option value="published">Publikasikan</option></select></div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}><button className="btn" disabled={loading}><Save size={16}/>{editing ? "Simpan perubahan" : "Simpan materi"}</button><button type="button" className="btn btn-secondary" onClick={()=>{setForm(blank);setEditing(null);setError("");setMessage("");}}>Kosongkan form</button></div>
        </form>
      </section>
      <section className="panel">
        <div className="panel-header"><div><h2>Daftar materi</h2><p>{items.length} materi tersimpan di database.</p></div><span className="badge">{items.filter(x=>x.status==="published").length} dipublikasikan</span></div>
        {loading ? <div className="empty">Memuat data...</div> : items.length === 0 ? <div className="empty">Belum ada materi. Tambahkan materi pertama melalui form di atas.</div> : <div className="table-wrap"><table><thead><tr><th>Materi</th><th>Sumber</th><th>Status</th><th>Aksi</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><strong>{item.title}</strong><div className="muted" style={{fontSize:11}}>{item.level}</div></td><td>{item.source_title || "Belum dicantumkan"}<div className="muted" style={{fontSize:11}}>{item.source_pages}</div></td><td><span className={`badge ${item.status==="draft"?"draft":""}`}>{item.status}</span></td><td><div style={{display:"flex",gap:7}}><button className="btn btn-secondary btn-small" onClick={()=>edit(item)}><Pencil size={13}/> Edit</button><button className="btn btn-secondary btn-small" onClick={()=>remove(item.id)} aria-label="Hapus materi"><Trash2 size={13}/></button></div></td></tr>)}</tbody></table></div>}
      </section>
    </main>
  </div>;
}
