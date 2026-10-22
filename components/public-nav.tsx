import Link from "next/link";

export default function PublicNav() {
  return (
    <nav className="navbar">
      <Link href="/" className="brand"><span className="brand-mark">ب</span><span>Bedah I‘rob</span></Link>
      <div className="nav-links">
        <Link className="hide-mobile" href="/materi">Materi</Link>
        <Link className="hide-mobile" href="/latihan">Latihan</Link>
        <Link className="btn btn-secondary btn-small" href="/login">Masuk</Link>
      </div>
    </nav>
  );
}
