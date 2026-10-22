"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Clock3 } from "lucide-react";
import { demoMaterials, type Material } from "@/lib/content";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function MaterialCatalog() {
  const [items, setItems] = useState<Material[]>(isSupabaseConfigured ? [] : demoMaterials);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { setItems(demoMaterials); setLoading(false); return; }
      const { data, error: queryError } = await supabase.from("materials")
        .select("id,title,slug,level,content,source_title,source_author,source_edition,source_pages,status")
        .eq("status", "published").order("created_at", { ascending: true });
      if (!active) return;
      if (queryError) setError("Materi dari database belum bisa dimuat. Periksa konfigurasi Supabase dan kebijakan akses publik.");
      else setItems((data || []) as Material[]);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="empty">Memuat materi...</div>;
  if (error) return <div className="notice error">{error}</div>;
  if (!items.length) return <div className="panel empty">Belum ada materi yang dipublikasikan. Admin dapat mengimpor paket konten lalu meninjau dan menerbitkannya.</div>;

  return <div className="feature-grid">
    {items.map((item) => <article className="feature-card" key={item.slug}>
      <div className="feature-icon"><BookOpen size={21}/></div>
      <span className="badge">{item.level || "Dasar"}</span>
      <h3 style={{marginTop:14}}>{item.title}</h3>
      <p style={{whiteSpace:"pre-line"}}>{(item.content || "").split("\n").filter((line) => line.trim() && !line.startsWith("Tujuan belajar") && !line.startsWith("Tujuan belajar siswa")).slice(1,3).join(" ").slice(0,180) || "Buka materi untuk membaca ringkasan, tujuan belajar, dan referensi sumber."}</p>
      <div className="muted" style={{fontSize:12,marginTop:12}}><Clock3 size={13} style={{display:"inline",verticalAlign:"-2px",marginRight:5}}/>{item.source_pages || "Referensi tersedia di detail materi"}</div>
      <div style={{marginTop:16}}><Link className="btn btn-secondary btn-small" href={`/materi/${item.slug}`}>Baca materi <ArrowUpRight size={14}/></Link></div>
    </article>)}
  </div>;
}
