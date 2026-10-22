import PublicNav from "@/components/public-nav";
import MaterialCatalog from "./material-catalog";

export const metadata = { title: "Materi Nahwu | Bedah I‘rob" };

export default function MaterialsPage() {
  return <main><div className="container"><PublicNav /><section className="section" style={{paddingTop:18}}>
    <span className="eyebrow">Perpustakaan belajar</span>
    <div className="section-heading" style={{marginTop:14}}><h2>Materi nahwu yang bisa ditelusuri sumbernya.</h2><p>Jelajahi rangkuman dari seluruh bab kitab, dari pembahasan kalam sampai waqaf. Kamu boleh belajar sebagai pengunjung tanpa login; rujukan halaman tercantum di setiap materi.</p></div>
    <MaterialCatalog />
  </section><footer className="footer">Materi dirangkum dari sumber yang dicantumkan. Periksa rujukan halaman untuk pembahasan lengkap.</footer></div></main>;
}
