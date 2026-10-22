"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Brain, BookOpen } from "lucide-react";
import { demoQuestions, type Question } from "@/lib/content";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function QuestionCatalog() {
  const [items, setItems] = useState<Question[]>(isSupabaseConfigured ? [] : demoQuestions);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      if (!supabase) { setItems(demoQuestions); setLoading(false); return; }
      const { data, error: queryError } = await supabase.from("questions")
        .select("id,slug,title,sentence,translation,analyses,difficulty,source_pages,status")
        .eq("status", "published").order("created_at", { ascending: true });
      if (!active) return;
      if (queryError) setError("Latihan dari database belum bisa dimuat. Periksa konfigurasi Supabase dan kebijakan akses publik.");
      else setItems((data || []).map((item: any) => ({ ...item, slug: item.slug || item.id })) as Question[]);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="empty">Memuat latihan...</div>;
  if (error) return <div className="notice error">{error}</div>;
  if (!items.length) return <div className="panel empty">Belum ada latihan yang dipublikasikan. Admin dapat mengimpor paket soal, memeriksa kunci jawaban, lalu menerbitkannya.</div>;

  return <div className="feature-grid">
    {items.map((item) => <article className="feature-card" key={item.slug}>
      <div className="feature-icon"><Brain size={21}/></div><span className="badge">{item.difficulty || "Dasar"}</span>
      <h3 style={{marginTop:14}}>{item.title}</h3>
      <div className="arabic-sentence" style={{fontSize:27,margin:"8px 0"}} dir="rtl">{item.sentence || item.analyses.map((a) => a.word).join(" ")}</div>
      <p>{item.translation || "Analisis kalimat ini secara menyeluruh."}</p>
      <div className="muted" style={{fontSize:12,marginTop:12}}><BookOpen size={13} style={{display:"inline",verticalAlign:"-2px",marginRight:5}}/>{item.analyses.length} kata untuk dianalisis</div>
      <div style={{marginTop:16}}><Link className="btn btn-secondary btn-small" href={`/latihan/${item.slug}`}>Mulai membedah <ArrowUpRight size={14}/></Link></div>
    </article>)}
  </div>;
}
