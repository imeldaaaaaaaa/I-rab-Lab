"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Plus, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ClassItem = { id:string; name:string; description:string|null; invite_code:string; is_active:boolean; created_at:string };

export default function TeacherClassesPage() {
  const router=useRouter();
  const [items,setItems]=useState<ClassItem[]>([]);
  const [name,setName]=useState("");
  const [description,setDescription]=useState("");
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(true);

  async function load() {
    if(!supabase){setError("Supabase belum dikonfigurasi.");setLoading(false);return;}
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.replace("/login");return;}
    const {data:profile}=await supabase.from("profiles").select("role").eq("id",user.id).single();
    if(profile?.role!=="teacher"&&profile?.role!=="admin"){setError("Halaman ini khusus guru.");setLoading(false);return;}
    const {data,error:e}=await supabase.from("classes").select("*").order("created_at",{ascending:false});
    if(e)setError(e.message);else setItems((data||[]) as ClassItem[]);
    setLoading(false);
  }
  useEffect(()=>{load();},[]);

  async function createClass(e:FormEvent) {
    e.preventDefault();setError("");setMessage("");
    if(!supabase)return;
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){setError("Silakan login kembali.");return;}
    const invite_code=Math.random().toString(36).slice(2,8).toUpperCase();
    const {error:e}=await supabase.from("classes").insert({name,description,invite_code,teacher_id:user.id,is_active:true});
    if(e){setError(e.message);return;}
    setName("");setDescription("");setMessage(`Kelas berhasil dibuat. Kode undangan: ${invite_code}`);await load();
  }

  return <div className="app-shell">
    <aside className="sidebar"><Link href="/" className="brand"><span className="brand-mark">ب</span><span>Bedah I‘rob</span></Link><div className="sidebar-label">Guru</div><nav className="side-nav"><Link className="side-link" href="/dashboard"><ArrowLeft size={17}/> Dashboard</Link><Link className="side-link active" href="/teacher/classes"><Users size={17}/> Kelas saya</Link></nav><div className="sidebar-bottom">Buat ruang kelas dan bagikan kode undangan kepada siswa.</div></aside>
    <main className="main-area">
      <header className="topbar"><div><h1>Kelas Saya</h1><div className="muted">Buat dan kelola ruang kelas pembelajaran.</div></div><span className="badge">Guru</span></header>
      {error&&<div className="notice error">{error}</div>}{message&&<div className="notice success">{message}</div>}
      <section className="panel">
        <div className="panel-header"><div><h2>Buat kelas baru</h2><p>Setiap kelas akan memiliki kode undangan tersendiri.</p></div><div className="feature-icon"><Plus/></div></div>
        <form onSubmit={createClass}>
          <div className="form-field"><label>Nama kelas</label><input className="input" value={name} onChange={e=>setName(e.target.value)} required placeholder="Contoh: Nahwu Dasar A"/></div>
          <div className="form-field"><label>Deskripsi (opsional)</label><textarea className="textarea" rows={3} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Ceritakan fokus pembelajaran kelas ini."/></div>
          <button className="btn"><Plus size={16}/> Buat kelas</button>
        </form>
      </section>
      <section className="panel">
        <div className="panel-header"><div><h2>Daftar kelas</h2><p>{items.length} kelas yang dapat kamu kelola.</p></div></div>
        {loading?<div className="empty">Memuat kelas...</div>:items.length===0?<div className="empty">Belum ada kelas. Buat kelas pertama melalui form di atas.</div>:<div className="course-list">{items.map(item=><div className="course-row" key={item.id}><div className="course-icon"><Users/></div><div className="course-row-main"><strong>{item.name}</strong><small>{item.description||"Belum ada deskripsi"} · {item.is_active?"Aktif":"Nonaktif"}</small><div style={{marginTop:8,display:"flex",alignItems:"center",gap:8}}><span className="badge">Kode: {item.invite_code}</span><button className="btn btn-secondary btn-small" onClick={()=>navigator.clipboard.writeText(item.invite_code)}><Copy size={12}/> Salin kode</button></div></div></div>)}</div>}
      </section>
    </main>
  </div>;
}
