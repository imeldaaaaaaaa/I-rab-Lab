"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpenCheck, GraduationCap } from "lucide-react";
import PublicNav from "@/components/public-nav";
import { demoMaterials, type Material } from "@/lib/content";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

function ContentLines({ content }: { content: string }) {
  const lines = content.split("\n");
  return <div className="lesson-copy">{lines.map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={index} style={{height:8}} />;
    if (/^\d+\./.test(trimmed) || trimmed.startsWith("- ")) return <p key={index} style={{paddingLeft:12,margin:"7px 0"}}>{trimmed}</p>;
    if (["Tujuan belajar", "Inti materi", "Pokok kaidah", "Contoh pembelajaran", "Kesalahan yang perlu dihindari", "Ringkasan", "Catatan akademik", "Empat syarat kalam", "Istilah terkait", "Contoh latihan baru", "I‘rab", "Pembagian ringkas dalam sumber", "Bina’", "Cara mengingat", "Rafa‘", "Nasab", "Khafadh/Jarr", "Jazam", "Catatan penting", "Sumber pembelajaran"].includes(trimmed)) return <h2 key={index} style={{fontSize:18,color:"var(--ink)",margin:"22px 0 8px"}}>{trimmed}</h2>;
    return <p key={index} style={{lineHeight:1.85,color:"#53665e",margin:"8px 0"}}>{trimmed}</p>;
  })}</div>;
}

export default function MaterialDetail({ slug }: { slug: string }) {
  const seed = demoMaterials.find((item) => item.slug === slug) || null;
  const [item, setItem] = useState<Material | null>(isSupabaseConfigured ? null : seed);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { setItem(seed); setLoading(false); return; }
      const { data, error: queryError } = await supabase.from("materials")
        .select("id,title,slug,level,content,source_title,source_author,source_edition,source_pages,status")
        .eq("slug", slug).eq("status", "published").maybeSingle();
      if (!active) return;
      if (queryError) setError("Materi belum bisa dimuat. Periksa konfigurasi database.");
      else setItem((data as Material | null) || null);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [slug, seed]);

  return <main><div className="container"><PublicNav /><section className="section" style={{paddingTop:16,maxWidth:820,margin:"0 auto"}}>
    <Link href="/materi" className="side-link" style={{display:"inline-flex",paddingLeft:0}}><ArrowLeft size={16}/> Semua materi</Link>
    {loading ? <div className="empty">Memuat materi...</div> : error ? <div className="notice error">{error}</div> : !item ? <div className="panel empty">Materi tidak ditemukan atau belum dipublikasikan.</div> : <>
      <span className="eyebrow"><BookOpenCheck size={14}/> Materi {item.level || "Dasar"}</span>
      <h1 style={{fontSize:"clamp(32px,5vw,48px)",lineHeight:1.1,letterSpacing:"-.04em",color:"var(--ink)",margin:"18px 0 10px"}}>{item.title}</h1>
      <div className="muted" style={{marginBottom:24}}>Sumber: {item.source_title || "Belum dicantumkan"} · {item.source_author || "Penulis belum dicantumkan"} · {item.source_pages || "Halaman belum dicantumkan"}</div>
      <article className="panel"><ContentLines content={item.content}/></article>
      <div className="notice">Catatan sumber: penjelasan ini merupakan rangkuman pembelajaran. Gunakan rujukan halaman di atas untuk memeriksa rincian lengkap dan pengecualian dalam kitab.</div>
      <div className="hero-actions"><Link className="btn" href="/latihan">Coba latihan terkait <GraduationCap size={16}/></Link><Link className="btn btn-secondary" href="/login">Masuk untuk menyimpan progres</Link></div>
    </>}
  </section><footer className="footer">Bedah I‘rob · Belajar terbuka untuk semua.</footer></div></main>;
}
