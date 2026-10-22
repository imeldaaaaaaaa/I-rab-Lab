import Link from "next/link";
import { ArrowUpRight, BookOpen, Brain, ChartNoAxesCombined, CheckCircle2, GraduationCap, LibraryBig, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main>
      <div className="container">
        <nav className="navbar">
          <Link href="/" className="brand">
            <span className="brand-mark">ب</span>
            <span>Bedah I‘rob</span>
          </Link>
          <div className="nav-links">
            <Link className="hide-mobile" href="/materi">Materi</Link>
            <Link className="hide-mobile" href="/latihan">Latihan</Link>
            <Link className="btn btn-secondary btn-small" href="/login">Masuk</Link>
          </div>
        </nav>
        <section className="hero">
          <div>
            <span className="eyebrow"><Sparkles size={14}/> Belajar nahwu dengan memahami</span>
            <h1>Jangan hanya membaca. <span>Bedah kalimatnya.</span></h1>
            <p>
              Ruang belajar nahwu dan i‘rob dengan rangkuman seluruh bab kitab untuk memahami kedudukan setiap kata,
              alasan gramatikalnya, dan hubungan antarkata dalam kalimat bahasa Arab.
            </p>
            <div className="hero-actions">
              <Link className="btn" href="/materi">Belajar tanpa login <ArrowUpRight size={16}/></Link>
              <Link className="btn btn-secondary" href="/latihan">Coba latihan</Link>
            </div>
            <p style={{fontSize:12, marginTop:18}}>Belajar anonim tanpa menyimpan hasil • Login untuk menyimpan progres</p>
          </div>
          <div className="hero-card">
            <div className="card-top">
              <div>
                <strong style={{color:"var(--ink)"}}>Laboratorium Bedah I‘rob</strong>
                <div className="muted" style={{fontSize:12, marginTop:5}}>Contoh latihan interaktif</div>
              </div>
              <span className="pill">Latihan dasar</span>
            </div>
            <div className="arabic-sentence">
              <span className="word-chip">كَتَبَ</span>
              <span className="word-chip active">الْمُعَلِّمُ</span>
              <span className="word-chip">الدَّرْسَ</span>
            </div>
            <div className="muted" style={{textAlign:"center", fontSize:12}}>Pilih kata, tentukan kedudukan, lalu jelaskan alasannya.</div>
            <div className="mini-analysis">
              <div className="mini-box"><small>Kata dipilih</small><strong style={{fontSize:19}}>الْمُعَلِّمُ</strong></div>
              <div className="mini-box"><small>Kedudukan</small><strong>فاعل — Fā‘il</strong></div>
              <div className="mini-box"><small>Status i‘rob</small><strong>Marfū‘</strong></div>
              <div className="mini-box"><small>Tanda</small><strong>Ḍammah</strong></div>
            </div>
          </div>
        </section>
        <section className="section" id="fitur">
          <div className="section-heading">
            <h2>Satu ruang belajar, banyak cara memahami.</h2>
            <p>Dirancang untuk belajar mandiri dan kelas yang dikelola pengajar, dengan materi yang bisa ditelusuri sumbernya.</p>
          </div>
          <div className="feature-grid">
            <div className="feature-card"><div className="feature-icon"><BookOpen/></div><h3>Materi terstruktur</h3><p>Pelajari nahwu bertahap dengan penjelasan, contoh, rangkuman, dan referensi.</p></div>
            <div className="feature-card"><div className="feature-icon"><Brain/></div><h3>Bedah kalimat</h3><p>Analisis kata demi kata, kedudukan i‘rob, tanda, dan alasan gramatikal.</p></div>
            <div className="feature-card"><div className="feature-icon"><ChartNoAxesCombined/></div><h3>Jejak belajar</h3><p>Siswa yang login dapat menyimpan hasil latihan; pengunjung bisa mencoba tanpa riwayat tersimpan.</p></div>
            <div className="feature-card"><div className="feature-icon"><GraduationCap/></div><h3>Ruang kelas</h3><p>Guru dapat membuat kelas, memberikan latihan, dan memantau perkembangan siswa.</p></div>
            <div className="feature-card"><div className="feature-icon"><LibraryBig/></div><h3>Referensi jelas</h3><p>Materi disusun dari sumber yang dicantumkan dan dapat diperiksa kembali.</p></div>
            <div className="feature-card"><div className="feature-icon"><CheckCircle2/></div><h3>Pembahasan terarah</h3><p>Setiap latihan memiliki kunci dan alasan yang ditinjau sebelum diterbitkan.</p></div>
          </div>
        </section>
        <section className="section" id="cara-belajar" style={{paddingTop:0}}>
          <div className="hero-card" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,alignItems:"center"}}>
            <div><span className="eyebrow">Belajar dengan alur yang jelas</span><h2 style={{fontSize:30,color:"var(--ink)",letterSpacing:"-.04em"}}>Pahami kaidahnya. Terapkan pada kalimat baru.</h2><p className="muted">Bedah I‘rob memadukan materi yang bersumber, latihan analisis, dan umpan balik agar siswa tidak hanya menghafal jawaban.</p></div>
            <div style={{display:"grid",gap:12}}>
              {["Pelajari materi dan referensi","Analisis kata dalam kalimat","Periksa alasan dan pembahasan","Pantau progres belajar"].map((item,i)=><div key={item} className="course-row"><div className="course-icon">{String(i+1).padStart(2,"0")}</div><div className="course-row-main"><strong>{item}</strong><small>Tahap {i+1} pembelajaran</small></div></div>)}
            </div>
          </div>
        </section>
        <footer className="footer">© {new Date().getFullYear()} Bedah I‘rob · Pengunjung dapat belajar tanpa login; progres tersimpan untuk siswa yang login.</footer>
      </div>
    </main>
  );
}
