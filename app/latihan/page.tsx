import PublicNav from "@/components/public-nav";
import QuestionCatalog from "./question-catalog";

export const metadata = { title: "Latihan Bedah I‘rob" };

export default function PracticeCatalogPage() {
  return <main><div className="container"><PublicNav /><section className="section" style={{paddingTop:18}}>
    <span className="eyebrow">Laboratorium i‘rob</span>
    <div className="section-heading" style={{marginTop:14}}><h2>Bedah kalimatnya, bukan sekadar pilih jawaban.</h2><p>Analisis setiap kata, tentukan kedudukan dan tanda i‘rab atau status bina’-nya, lalu tuliskan alasan gramatikal. Pengunjung boleh mencoba tanpa login.</p></div>
    <QuestionCatalog />
  </section><footer className="footer">Jawaban pengunjung tidak disimpan. Login diperlukan untuk menyimpan progres belajar.</footer></div></main>;
}
