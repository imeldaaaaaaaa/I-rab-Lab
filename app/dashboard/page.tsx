"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, BookOpenCheck, ChartNoAxesCombined, ClipboardList, GraduationCap, LayoutDashboard, LibraryBig, LogOut, Plus, Users } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

type Profile = { id: string; full_name: string | null; role: "admin" | "teacher" | "student" };

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured || !supabase) { setLoading(false); setNotice("Database belum dikonfigurasi. Lihat README untuk langkah setup."); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data, error } = await supabase.from("profiles").select("id, full_name, role").eq("id", user.id).single();
      if (error) setNotice("Profil belum tersedia. Pastikan SQL database sudah dijalankan di Supabase.");
      else setProfile(data as Profile);
      setLoading(false);
    }
    load();
  }, [router]);

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const role = profile?.role;
  const links = role === "admin"
    ? [{href:"/admin/materials",label:"Kelola materi",icon:<BookOpen/>},{href:"/admin/questions",label:"Bank soal",icon:<ClipboardList/>},{href:"/admin/import",label:"Impor paket konten",icon:<LibraryBig/>}]
    : role === "teacher"
    ? [{href:"/teacher/classes",label:"Kelas saya",icon:<Users/>}]
    : [{href:"/student/classes",label:"Kelas saya",icon:<Users/>},{href:"/student/practice",label:"Latihan i‘rob",icon:<BookOpenCheck/>}];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand"><span className="brand-mark">ب</span><span>Bedah I‘rob</span></Link>
        <div className="sidebar-label">Menu utama</div>
        <nav className="side-nav">
          <Link className="side-link active" href="/dashboard"><LayoutDashboard size={17}/> Dashboard</Link>
          {links.map(l=><Link className="side-link" key={l.href} href={l.href}>{l.icon}{l.label}</Link>)}
          {role === "teacher" && <Link className="side-link" href="/student/practice"><BookOpenCheck size={17}/> Pratinjau latihan</Link>}
        </nav>
        <div className="sidebar-bottom">Belajar nahwu dengan memahami.<br/>Materi, latihan, dan progres dalam satu ruang.</div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div><h1>Dashboard</h1><div className="muted">Ringkasan perjalanan belajar di Bedah I‘rob.</div></div>
          <button className="btn btn-secondary btn-small" onClick={signOut}><LogOut size={15}/> Keluar</button>
        </header>
        {loading ? <div className="panel">Memuat profil...</div> : notice ? <div className="notice">{notice}</div> : profile ? <>
          <div className="panel" style={{background:"var(--ink)",color:"white",border:"none"}}>
            <div className="eyebrow" style={{background:"rgba(255,255,255,.15)",color:"white"}}>Ruang belajar bahasa Arab</div>
            <h2 style={{fontSize:30,margin:"16px 0 8px",letterSpacing:"-.04em"}}>Ahlan wa sahlan, {profile.full_name || "pengguna"}!</h2>
            <p style={{color:"#d1e3d9",lineHeight:1.7,margin:0}}>Kamu masuk sebagai <strong>{profile.role}</strong>. Pilih ruang kerja di bawah untuk melanjutkan.</p>
          </div>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-label">Peran akun</div><div className="stat-value" style={{fontSize:22,textTransform:"capitalize"}}>{profile.role}</div><div className="stat-foot">Hak akses berdasarkan peran</div></div>
            <div className="stat-card"><div className="stat-label">Pembelajaran</div><div className="stat-value">Nahwu</div><div className="stat-foot">Materi dan latihan i‘rob</div></div>
            <div className="stat-card"><div className="stat-label">Referensi</div><div className="stat-value">Terarah</div><div className="stat-foot">Sumber materi dicantumkan</div></div>
            <div className="stat-card"><div className="stat-label">Platform</div><div className="stat-value">Aktif</div><div className="stat-foot">Fondasi MVP</div></div>
          </div>
          <div className="panel">
            <div className="panel-header"><div><h2>Ruang kerja kamu</h2><p>Menu yang tersedia untuk peran akunmu.</p></div></div>
            <div className="course-list">
              {links.map(l=><Link className="course-row" key={l.href} href={l.href}><div className="course-icon">{l.icon}</div><div className="course-row-main"><strong>{l.label}</strong><small>Buka dan kelola bagian ini</small></div><Plus size={18} color="var(--muted)"/></Link>)}
              {role === "student" && <Link className="course-row" href="/student/practice"><div className="course-icon"><ChartNoAxesCombined/></div><div className="course-row-main"><strong>Latihan bedah i‘rob</strong><small>Analisis kata, kedudukan, dan alasan</small></div><Plus size={18} color="var(--muted)"/></Link>}
              {role === "admin" && <div className="course-row"><div className="course-icon"><LibraryBig/></div><div className="course-row-main"><strong>Referensi materi</strong><small>Pengelolaan referensi lanjutan akan dikembangkan setelah fondasi awal.</small></div></div>}
              {role === "teacher" && <div className="course-row"><div className="course-icon"><GraduationCap/></div><div className="course-row-main"><strong>Pantau perkembangan siswa</strong><small>Fondasi kelas sudah tersedia; laporan tugas dan progres akan disempurnakan pada tahap berikutnya.</small></div></div>}
            </div>
          </div>
        </> : <div className="notice">Profil pengguna tidak ditemukan. Periksa setup database atau hubungi admin.</div>}
      </main>
    </div>
  );
}
