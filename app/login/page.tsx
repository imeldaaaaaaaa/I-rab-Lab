"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpenCheck } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(""); setError("");
    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase belum dikonfigurasi. Ikuti README untuk mengisi .env.local dan menjalankan SQL database.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.push("/dashboard");
        router.refresh();
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: name } },
        });
        if (authError) throw authError;
        if (data.session) {
          setMessage("Akun berhasil dibuat. Kamu bisa melanjutkan ke dashboard.");
          router.push("/dashboard");
          router.refresh();
        } else {
          setMessage("Pendaftaran berhasil. Periksa email jika konfirmasi email diaktifkan di Supabase.");
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-wrap">
      <div className="container">
        <nav className="navbar">
          <Link href="/" className="brand"><span className="brand-mark">ب</span><span>Bedah I‘rob</span></Link>
          <Link href="/" className="muted"><ArrowLeft size={14} style={{display:"inline",verticalAlign:"middle"}}/> Kembali ke beranda</Link>
        </nav>
        <section className="form-card">
          <div className="feature-icon"><BookOpenCheck/></div>
          <h1>{mode === "login" ? "Selamat datang kembali" : "Buat akun siswa"}</h1>
          <p className="muted">{mode === "login" ? "Masuk untuk melanjutkan perjalanan belajar nahwu." : "Daftar untuk mulai belajar di Bedah I‘rob."}</p>
          {!isSupabaseConfigured && <div className="notice">Mode setup: koneksi database belum diisi. Kamu bisa menyiapkan Supabase mengikuti README.</div>}
          {error && <div className="notice error">{error}</div>}
          {message && <div className="notice success">{message}</div>}
          <form onSubmit={handleSubmit}>
            {mode === "signup" && <div className="form-field"><label>Nama lengkap</label><input className="input" value={name} onChange={e=>setName(e.target.value)} required placeholder="Nama kamu"/></div>}
            <div className="form-field"><label>Email</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="nama@email.com"/></div>
            <div className="form-field"><label>Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required placeholder="Minimal 6 karakter"/></div>
            <button className="btn" style={{width:"100%",marginTop:8}} disabled={loading}>{loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar sebagai siswa"}</button>
          </form>
          <p className="muted" style={{fontSize:13,marginTop:18,textAlign:"center"}}>
            {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
            <button className="link-button" onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");setMessage("");}}>
              {mode === "login" ? "Daftar di sini" : "Masuk"}
            </button>
          </p>
          <p className="muted" style={{fontSize:11,marginTop:20}}>Pendaftaran publik membuat akun siswa. Akun guru dan admin ditetapkan oleh pengelola melalui database.</p>
          <p className="muted" style={{fontSize:13,marginTop:14,textAlign:"center"}}>Belum ingin membuat akun? <Link className="link-button" href="/materi">Belajar sebagai pengunjung</Link></p>
        </section>
      </div>
    </main>
  );
}
