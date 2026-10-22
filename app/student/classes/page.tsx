"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";

type ClassItem = { id:string; name:string; description:string|null; invite_code:string; teacher_id:string };

export default function StudentClassesPage() {
  const router=useRouter();
  const [items,setItems]=useState<ClassItem[]>([]);
  const [code,setCode]=useState("");
  const [error,setError]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(true);

  async function load() {
    if(!supabase){setError("Supabase belum dikonfigurasi.");setLoading(false);return;}
    const {data:{user}}=await supabase.auth.getUser();
    if(!user){router.replace("/login");return;}
    const {data,error:e}=await supabase.from("class_members").select("classes(id,name,description,invite_code,teacher_id)").eq("student_id",user.id);
    if(e)setError(e.message);else setItems((data||[]).map((row:any)=>row.classes).filter(Boolean) as ClassItem[]);
    setLoading(false);
  }
  useEffect(()=>{load();},[]);

  async function join(e:FormEvent) {
    e.preventDefault();setError("");setMessage("");
    if(!supabase)return;
    const {data,error:e}=await supabase.rpc("join_class_by_code",{p_invite_code:code.trim().toUpperCase()});
    if(e){setError(e.message);return;}
    setMessage("Berhasil bergabung ke kelas.");setCode("");await load();
  }

  return <div className="app-shell">
    <aside className="sidebar"><Link href="/" className="brand"><span className="brand-mark">ب</span><span>Bedah I‘rob</span></Link><div className="sidebar-label">Siswa</div><nav className="side-nav"><Link className="side-link" href="/dashboard"><ArrowLeft size={17}/> Dashboard</Link><Link className="side-link active" href="/student/classes"><Users size={17}/> Kelas saya</Link><Link className="side-link" href="/student/practice"><BookOpen size={17}/> Latihan i‘rob</Link></nav></aside>
    <main className="main-area">
      <header className="topbar"><div><h1>Kelas Saya</h1><div className="muted">Gabung kelas dengan kode dari guru.</div></div><span className="badge">Siswa</span></header>
      {error&&<div className="notice error">{error}</div>}{message&&<div className="notice success">{message}</div>}
      <section className="panel"><div className="panel-header"><div><h2>Gabung kelas</h2><p>Minta kode undangan dari guru kamu.</p></div></div><form onSubmit={join}><div className="form-field"><label>Kode kelas</label><input className="input" value={code} onChange={e=>setCode(e.target.value)} required placeholder="Contoh: ABC123" style={{textTransform:"uppercase"}}/></div><button className="btn">Gabung kelas</button></form></section>
      <section className="panel"><div className="panel-header"><div><h2>Kelas yang diikuti</h2><p>{items.length} kelas.</p></div></div>{loading?<div className="empty">Memuat kelas...</div>:items.length===0?<div className="empty">Kamu belum bergabung ke kelas mana pun.</div>:<div className="course-list">{items.map(item=><div className="course-row" key={item.id}><div className="course-icon"><Users/></div><div className="course-row-main"><strong>{item.name}</strong><small>{item.description||"Belajar bersama guru"}</small></div></div>)}</div>}</section>
    </main>
  </div>;
}
