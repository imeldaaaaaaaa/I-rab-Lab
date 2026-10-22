"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileUp, Database, Download, ShieldCheck } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { ContentPack } from "@/lib/content";

export default function AdminImportPage() {
  const router = useRouter();
  const [pack, setPack] = useState<ContentPack | null>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function checkAccess() {
      if (!supabase) { setChecking(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      if (!active) return;
      setIsAdmin(profile?.role === "admin");
      if (profile?.role !== "admin") setError("Halaman impor hanya dapat digunakan oleh admin.");
      setChecking(false);
    }
    checkAccess();
    return () => { active = false; };
  }, [router]);

  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    setError(""); setMessage(""); setPack(null);
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    try {
      const parsed = JSON.parse(await file.text()) as ContentPack;
      if (!parsed || !Array.isArray(parsed.materials) || !Array.isArray(parsed.questions) || !parsed.source?.title) {
        throw new Error("Format JSON tidak sesuai. Paket harus memiliki source, materials, dan questions.");
      }
      for (const material of parsed.materials) {
        if (!material.slug || !material.title || !material.content) throw new Error("Setiap materi wajib memiliki slug, title, dan content.");
      }
      for (const question of parsed.questions) {
        if (!question.slug || !question.title || !question.sentence || !Array.isArray(question.analyses) || question.analyses.length === 0) {
          throw new Error("Setiap soal wajib memiliki slug, title, sentence, dan analyses yang berisi minimal satu kata.");
        }
      }
      setPack(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "File JSON tidak dapat dibaca.");
    }
  }

  async function importToDatabase() {
    setError(""); setMessage("");
    if (!pack) { setError("Pilih paket JSON yang valid terlebih dahulu."); return; }
    if (!supabase || !isSupabaseConfigured) { setError("Supabase belum dikonfigurasi. Untuk saat ini file hanya dapat dipratinjau; impor permanen aktif setelah database disiapkan."); return; }
    if (!isAdmin) { setError("Akun ini tidak memiliki peran admin."); return; }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Sesi login tidak ditemukan. Silakan login kembali."); setLoading(false); return; }

      const materialRows = pack.materials.map((material) => ({
        slug: material.slug,
        title: material.title,
        level: material.level || "Dasar",
        content: material.content,
        source_title: material.source_title || pack.source.title,
        source_author: material.source_author || pack.source.author,
        source_edition: material.source_edition || `${pack.source.publisher || ""}${pack.source.year ? `, ${pack.source.year}` : ""}`.trim(),
        source_pages: material.source_pages || null,
        status: material.status || "draft",
        created_by: user.id,
        updated_at: new Date().toISOString()
      }));
      const materialResult = await supabase.from("materials").upsert(materialRows, { onConflict: "slug" }).select("id,slug");
      if (materialResult.error) throw new Error(`Gagal mengimpor materi: ${materialResult.error.message}`);

      const materialIds = new Map<string, string>();
      (materialResult.data || []).forEach((row) => materialIds.set(row.slug, row.id));
      const missingSlugs = pack.materials.map((material) => material.slug).filter((slug) => !materialIds.has(slug));
      if (missingSlugs.length) {
        const { data, error: lookupError } = await supabase.from("materials").select("id,slug").in("slug", missingSlugs);
        if (lookupError) throw new Error(`Materi tersimpan, tetapi pemetaan ID gagal: ${lookupError.message}`);
        (data || []).forEach((row) => materialIds.set(row.slug, row.id));
      }

      const questionRows = pack.questions.map((question) => ({
        slug: question.slug,
        title: question.title,
        sentence: question.sentence,
        translation: question.translation || null,
        analyses: question.analyses,
        difficulty: question.difficulty || "Dasar",
        source_material_id: question.material_slug ? materialIds.get(question.material_slug) || null : null,
        source_pages: question.source_pages || null,
        status: question.status || "draft",
        created_by: user.id,
        updated_at: new Date().toISOString()
      }));
      const questionResult = await supabase.from("questions").upsert(questionRows, { onConflict: "slug" });
      if (questionResult.error) throw new Error(`Materi tersimpan, tetapi impor soal gagal: ${questionResult.error.message}`);
      setMessage(`Berhasil mengimpor ${materialRows.length} materi dan ${questionRows.length} latihan. Konten dari paket awal berstatus draft; tinjau kunci jawaban lalu terbitkan melalui menu Kelola Materi dan Bank Soal.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impor gagal. Periksa skema database dan koneksi.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="app-shell">
    <aside className="sidebar"><Link href="/" className="brand"><span className="brand-mark">ب</span><span>Bedah I‘rob</span></Link><div className="sidebar-label">Admin</div><nav className="side-nav"><Link className="side-link" href="/dashboard"><ArrowLeft size={17}/> Dashboard</Link><Link className="side-link" href="/admin/materials">Kelola materi</Link><Link className="side-link" href="/admin/questions">Bank soal</Link><Link className="side-link active" href="/admin/import"><FileUp size={17}/> Impor konten</Link></nav><div className="sidebar-bottom">Impor hanya tersedia bagi admin setelah Supabase dikonfigurasi.</div></aside>
    <main className="main-area">
      <header className="topbar"><div><h1>Impor Paket Materi & Soal</h1><div className="muted">Masukkan satu paket JSON untuk menambahkan banyak konten sekaligus.</div></div><span className="badge">Admin</span></header>
      {!isSupabaseConfigured && <div className="notice">Mode lokal tanpa database: kamu dapat memilih dan memeriksa paket JSON, tetapi konten belum dapat disimpan untuk semua pengunjung. Setelah Supabase siap, login sebagai admin untuk melakukan impor permanen.</div>}
      {checking && <div className="notice">Memeriksa akses admin...</div>}
      {error && <div className="notice error">{error}</div>}{message && <div className="notice success">{message}</div>}
      <section className="panel">
        <div className="panel-header"><div><h2>1. Pilih paket konten</h2><p>Paket lengkap berisi rangkuman seluruh bab/topik dan latihan baru berbasis referensi kitab.</p></div><FileUp size={22}/></div>
        <p className="muted"><strong>Sumber:</strong> Intisari Kitab Al-Kawakib Al-Durriyyah Syarah Mutammimah Al-Jurumiyyah · Iswandi El-Nisamy · CV. Manhaji Medan, 2020.</p>
        <div className="form-field"><label>File paket (.json)</label><input className="input" type="file" accept=".json,application/json" onChange={readFile}/></div>
        {fileName && <div className="muted">File dipilih: {fileName}</div>}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:14}}><a className="btn btn-secondary" href="/bedah-irob-kurikulum-lengkap.json" download><Download size={15}/> Unduh paket kurikulum lengkap</a><a className="btn btn-secondary" href="/materi">Lihat materi publik</a></div>
      </section>
      {pack && <section className="panel">
        <div className="panel-header"><div><h2>2. Pratinjau paket</h2><p>Periksa isi paket sebelum memasukkannya ke database.</p></div><ShieldCheck size={22}/></div>
        <div className="stats-grid" style={{gridTemplateColumns:"repeat(3,1fr)"}}><div className="stat-card"><div className="stat-label">Materi</div><div className="stat-value">{pack.materials.length}</div></div><div className="stat-card"><div className="stat-label">Latihan</div><div className="stat-value">{pack.questions.length}</div></div><div className="stat-card"><div className="stat-label">Status awal</div><div className="stat-value" style={{fontSize:20}}>Draft</div></div></div>
        <h3 style={{color:"var(--ink)"}}>Daftar materi</h3><ul>{pack.materials.map((item) => <li key={item.slug} style={{margin:"8px 0"}}><strong>{item.title}</strong> <span className="muted">· {item.source_pages || "Halaman belum diisi"}</span></li>)}</ul>
        <h3 style={{color:"var(--ink)",marginTop:22}}>Daftar latihan</h3><ul>{pack.questions.map((item) => <li key={item.slug} style={{margin:"8px 0"}}><strong>{item.title}</strong> <span className="muted">· {item.analyses.length} kata · {item.difficulty}</span></li>)}</ul>
        <div className="notice">Paket diimpor sebagai draft agar kamu dapat memeriksa materi, rujukan halaman, dan kunci analisis terlebih dahulu. Setelah diperiksa, terbitkan konten dari menu admin.</div>
        <button className="btn" onClick={importToDatabase} disabled={loading || checking || (isSupabaseConfigured && !isAdmin)}><Database size={16}/>{loading ? "Mengimpor..." : "Impor ke database"}</button>
      </section>}
      <section className="panel"><div className="panel-header"><div><h2>Format paket</h2><p>Untuk paket berikutnya, pertahankan struktur JSON yang sama.</p></div></div><p className="muted">Paket harus memiliki <code>source</code>, <code>materials</code>, dan <code>questions</code>. Setiap soal memiliki kalimat, analisis kata per kata, kunci, alasan, tingkat kesulitan, serta rujukan. Konten yang berhasil diimpor disimpan di Supabase, bukan di localStorage browser.</p></section>
    </main>
  </div>;
}
