'use client';

import { useMemo, useState } from 'react';
import { caseStates, exercises, positions, signs, wordKinds, type CaseState, type Exercise, type Position, type Sign, type SourceType, type WordKind } from '@/data/exercises';

type Answer = { kind: WordKind; position: Position; state: CaseState; sign: Sign };
const emptyAnswer: Answer = { kind: 'Isim', position: 'Fā‘il', state: 'Marfū‘', sign: 'Ḍammah' };
const sourceFilters: Array<'Semua' | SourceType> = ['Semua', 'Umum', 'Teks klasik', "Al-Qur'an"];

function AppIcon({ name }: { name: string }) {
  const icons: Record<string, string> = { book: '▤', target: '◎', chart: '▥', spark: '✦', arrow: '↗', check: '✓', lock: '⌑', reset: '↻' };
  return <span aria-hidden="true" className="icon">{icons[name] ?? '•'}</span>;
}

export default function Home() {
  const [source, setSource] = useState<'Semua' | SourceType>('Semua');
  const [exerciseId, setExerciseId] = useState(exercises[0].id);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [checked, setChecked] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);

  const availableExercises = useMemo(() => exercises.filter((item) => source === 'Semua' || item.source === source), [source]);
  const exercise: Exercise = availableExercises.find((item) => item.id === exerciseId) ?? availableExercises[0] ?? exercises[0];
  const activeIndex = Math.min(selectedIndex, exercise.words.length - 1);
  const activeWord = exercise.words[activeIndex];
  const answerKey = `${exercise.id}:${activeIndex}`;
  const answer = answers[answerKey] ?? { kind: activeWord.kind, position: emptyAnswer.position, state: emptyAnswer.state, sign: emptyAnswer.sign };
  const isCorrect = answer.kind === activeWord.kind && answer.position === activeWord.position && answer.state === activeWord.state && answer.sign === activeWord.sign;
  const answeredCount = Object.keys(answers).filter((key) => key.startsWith(`${exercise.id}:`)).length;
  const correctCount = exercise.words.filter((word, index) => {
    const a = answers[`${exercise.id}:${index}`];
    return a && a.kind === word.kind && a.position === word.position && a.state === word.state && a.sign === word.sign;
  }).length;

  function changeSource(next: 'Semua' | SourceType) {
    setSource(next);
    const first = exercises.find((item) => next === 'Semua' || item.source === next);
    if (first) setExerciseId(first.id);
    setSelectedIndex(0);
    setChecked(false);
    setHintShown(false);
  }
  function changeExercise(id: string) {
    setExerciseId(id);
    setSelectedIndex(0);
    setChecked(false);
    setHintShown(false);
  }
  function updateAnswer<K extends keyof Answer>(key: K, value: Answer[K]) {
    setAnswers((prev) => ({ ...prev, [answerKey]: { ...(prev[answerKey] ?? emptyAnswer), [key]: value } }));
    setCompleted((prev) => prev.filter((key) => key !== answerKey));
    setChecked(false);
  }
  function checkAnswer() {
    setChecked(true);
    if (isCorrect && !completed.includes(answerKey)) setCompleted((prev) => [...prev, answerKey]);
  }
  function resetExercise() {
    setAnswers((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => !key.startsWith(`${exercise.id}:`))));
    setCompleted((prev) => prev.filter((key) => !key.startsWith(`${exercise.id}:`)));
    setSelectedIndex(0);
    setChecked(false);
    setHintShown(false);
  }
  function nextWord() {
    setSelectedIndex((prev) => (prev + 1) % exercise.words.length);
    setChecked(false);
    setHintShown(false);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#top" aria-label="Bedah I'rab beranda">
          <span className="brand-mark">بِ</span>
          <span><strong>bedah<span className="brand-green">i‘rab</span></strong><small>LABORATORIUM NAHWU</small></span>
        </a>
        <div className="sidebar-label">RUANG BELAJAR</div>
        <nav className="nav-list" aria-label="Navigasi utama">
          <a className="nav-item active" href="#workspace"><AppIcon name="target"/> Bedah kalimat <span className="nav-dot"/></a>
          <a className="nav-item" href="#materi"><AppIcon name="book"/> Materi Nahwu</a>
          <a className="nav-item" href="#progress"><AppIcon name="chart"/> Progres belajar</a>
        </nav>
        <div className="sidebar-spacer"/>
        <div className="sidebar-note">
          <div className="note-icon"><AppIcon name="spark"/></div>
          <strong>Belajar sampai paham.</strong>
          <p>Setiap kata punya alasan. Temukan kaidahnya, bukan sekadar jawabannya.</p>
        </div>
        <div className="sidebar-footer"><span className="status-dot"/> Versi belajar 0.1 <span>•</span> Dibuat untuk penuntut ilmu</div>
      </aside>

      <section className="main-area" id="top">
        <header className="topbar">
          <div className="breadcrumb">Ruang belajar <span>/</span> <strong>Bedah kalimat</strong></div>
          <div className="topbar-right"><span className="level-pill"><span>✦</span> PEMULA</span><div className="avatar">ط</div></div>
        </header>

        <div className="page-content" id="workspace">
          <div className="page-heading">
            <div>
              <div className="eyebrow"><span/> INTERACTIVE NAHWU LAB</div>
              <h1>Bedah <em>i‘rab.</em></h1>
              <p>Kenali setiap kata, temukan kedudukannya, pahami alasannya.</p>
            </div>
            <div className="heading-decoration" aria-hidden="true"><span>ا</span><span>ل</span><span>ن</span><span>ح</span><span>و</span></div>
          </div>

          <section className="stats-grid" aria-label="Ringkasan latihan">
            <div className="stat-card"><div className="stat-icon green"><AppIcon name="book"/></div><div><span className="stat-label">KALIMAT TERSEDIA</span><strong>{exercises.length.toString().padStart(2, '0')} <small>latihan</small></strong></div><span className="stat-corner">↗</span></div>
            <div className="stat-card"><div className="stat-icon cream"><AppIcon name="target"/></div><div><span className="stat-label">KATA DIKUPAS</span><strong>{completed.length.toString().padStart(2, '0')} <small>jawaban benar</small></strong></div><span className="stat-corner">✳</span></div>
            <div className="stat-card"><div className="stat-icon lavender"><AppIcon name="spark"/></div><div><span className="stat-label">MODE BELAJAR</span><strong>Aktif <small>mandiri</small></strong></div><span className="stat-corner">✦</span></div>
          </section>

          <div className="section-heading"><div><span className="section-kicker">MULAI DARI SINI</span><h2>Ruang bedah kalimat</h2></div><button className="text-button" onClick={resetExercise}><AppIcon name="reset"/> Ulangi latihan</button></div>

          <div className="workspace-grid">
            <section className="sentence-card">
              <div className="card-topline"><div className="source-tag"><span className={`source-dot ${exercise.source === "Al-Qur'an" ? 'quran' : exercise.source === 'Teks klasik' ? 'classic' : ''}`}/>{exercise.source}</div><span className="exercise-number">LATIHAN {String(exercises.findIndex((e) => e.id === exercise.id) + 1).padStart(2, '0')} / {String(exercises.length).padStart(2, '0')}</span></div>
              <h3>{exercise.title}</h3>
              <div className="arabic-stage" dir="rtl" lang="ar">
                <div className="arabic-sentence">{exercise.words.map((word, index) => <button key={`${exercise.id}-${word.token}`} className={`word-chip ${activeIndex === index ? 'selected' : ''} ${checked && activeIndex === index ? (isCorrect ? 'word-correct' : 'word-wrong') : ''}`} onClick={() => { setSelectedIndex(index); setChecked(false); setHintShown(false); }} aria-pressed={activeIndex === index}>{word.token}</button>)}</div>
                <div className="arabic-translation" dir="ltr">“{exercise.translation}”</div>
              </div>
              <div className="sentence-context"><span className="context-icon">i</span><p>{exercise.context}{exercise.reference ? <strong> {exercise.reference}</strong> : null}</p></div>
              <div className="word-progress"><div className="progress-label"><span>KATA DALAM KALIMAT</span><strong>{activeIndex + 1} <small>/ {exercise.words.length}</small></strong></div><div className="progress-track">{exercise.words.map((word, index) => <button key={`${word.token}-progress`} onClick={() => { setSelectedIndex(index); setChecked(false); setHintShown(false); }} className={`progress-segment ${index <= activeIndex ? 'filled' : ''} ${completed.includes(`${exercise.id}:${index}`) ? 'done' : ''}`} aria-label={`Pilih kata ${word.token}`}/>)}</div></div>
              <div className="word-picker-label">PILIH KATA UNTUK DIBEDAH</div>
              <div className="word-picker" dir="rtl">{exercise.words.map((word, index) => <button key={`pick-${word.token}`} onClick={() => { setSelectedIndex(index); setChecked(false); setHintShown(false); }} className={`word-pick ${activeIndex === index ? 'active' : ''}`}>{word.token}<span>{index + 1}</span></button>)}</div>
              <div className="sentence-actions"><button className="button-secondary" onClick={() => setHintShown((prev) => !prev)}><AppIcon name="spark"/>{hintShown ? 'Sembunyikan petunjuk' : 'Beri aku petunjuk'}</button><button className="button-primary" onClick={nextWord}>Kata berikutnya <AppIcon name="arrow"/></button></div>
              {hintShown && <div className="hint-box"><strong>Petunjuk kecil</strong><p>{activeWord.kind === 'Fi’il' ? 'Cari bentuk kata yang menunjukkan pekerjaan atau keadaan. Perhatikan juga apakah waktunya lampau, sekarang/akan datang, atau berupa perintah.' : activeWord.kind === 'Huruf' ? 'Perhatikan apakah kata ini memiliki makna gramatikal yang memengaruhi kata setelahnya.' : 'Tanyakan peran kata ini: apakah menjadi pokok pembicaraan, informasi, pelaku, objek, atau mengikuti kata lain?'}</p></div>}
            </section>

            <section className="analysis-card">
              <div className="analysis-heading"><div className="analysis-symbol">ت</div><div><span className="section-kicker">ANALISIS KATA</span><h3>Bedah morfologi & nahwu</h3></div></div>
              <div className="active-word-banner"><div><span>KATA YANG DIPILIH</span><strong dir="rtl" lang="ar">{activeWord.token}</strong></div><span className="word-index-badge">Kata {activeIndex + 1}</span></div>
              <div className="form-fields">
                <label className="field"><span><b>01</b> Jenis kata <i>نوع الكلمة</i></span><select value={answer.kind} onChange={(e) => updateAnswer('kind', e.target.value as WordKind)}><option value="Isim">Isim (اسم)</option><option value="Fi’il">Fi‘il (فعل)</option><option value="Huruf">Huruf (حرف)</option></select></label>
                <label className="field"><span><b>02</b> Kedudukan nahwu <i>المحل الإعرابي</i></span><select value={answer.position} onChange={(e) => updateAnswer('position', e.target.value as Position)}>{positions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label className="field"><span><b>03</b> Status i‘rab <i>الحالة الإعرابية</i></span><select value={answer.state} onChange={(e) => updateAnswer('state', e.target.value as CaseState)}>{caseStates.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label className="field"><span><b>04</b> Tanda i‘rab <i>علامة الإعراب</i></span><select value={answer.sign} onChange={(e) => updateAnswer('sign', e.target.value as Sign)}>{signs.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              </div>
              <button className="button-check" onClick={checkAnswer}><AppIcon name="check"/> Periksa jawaban <span>→</span></button>
              {checked && <div className={`feedback-box ${isCorrect ? 'success' : 'error'}`} role="status"><div className="feedback-title"><span>{isCorrect ? '✓' : '!'}</span><strong>{isCorrect ? 'Tepat sekali! Jawabanmu benar.' : 'Belum tepat. Coba periksa lagi.'}</strong></div><p>{isCorrect ? activeWord.explanation : 'Perhatikan hubungan kata ini dengan kata lain dalam kalimat. Gunakan petunjuk, lalu sesuaikan jenis kata, kedudukan, status, dan tandanya.'}</p>{isCorrect && <div className="full-irab" dir="rtl" lang="ar">{activeWord.fullIrab}</div>}<button className="feedback-link" onClick={() => setHintShown(true)}>Lihat petunjuk <span>↗</span></button></div>}
              <div className="analysis-footnote"><AppIcon name="lock"/><span>Jawaban diperiksa menggunakan kunci latihan terstruktur, bukan penilaian AI.</span></div>
            </section>
          </div>

          <section className="exercise-library" id="materi"><div className="section-heading"><div><span className="section-kicker">PERPUSTAKAAN LATIHAN</span><h2>Pilih sumber belajarmu</h2></div><span className="library-count">{availableExercises.length} latihan</span></div><div className="filter-row">{sourceFilters.map((item) => <button key={item} className={`filter-pill ${source === item ? 'selected' : ''}`} onClick={() => changeSource(item)}>{item === 'Semua' ? 'Semua sumber' : item}</button>)}</div><div className="exercise-list">{availableExercises.map((item, index) => <button key={item.id} className={`exercise-row ${exercise.id === item.id ? 'current' : ''}`} onClick={() => changeExercise(item.id)}><span className={`exercise-type-icon ${item.source === "Al-Qur'an" ? 'quran' : item.source === 'Teks klasik' ? 'classic' : ''}`}>{item.source === "Al-Qur'an" ? '۞' : item.source === 'Teks klasik' ? 'ك' : 'ع'}</span><span className="exercise-row-text"><strong>{item.title}</strong><small>{item.source}{item.reference ? ` · ${item.reference}` : ''}</small></span><span className="exercise-arabic" dir="rtl" lang="ar">{item.sentence}</span><span className="row-arrow">↗</span></button>)}</div></section>

          <section className="progress-section" id="progress"><div><span className="section-kicker">PROGRES SESI INI</span><h2>Terus latih kepekaan nahwumu.</h2><p>Latihan benar tersimpan sementara di sesi browser ini. Akun dan sinkronisasi lintas perangkat bisa ditambahkan pada tahap berikutnya.</p></div><div className="progress-summary"><div className="progress-ring"><div><strong>{completed.length}</strong><span>benar</span></div></div><div className="progress-summary-text"><strong>{completed.length} jawaban benar</strong><span>{Math.max(0, exercises.reduce((sum, item) => sum + item.words.length, 0) - completed.length)} kesempatan latihan tersisa di bank soal demo</span></div></div></section>
          <footer className="main-footer"><span>بِسْمِ الْعِلْمِ نَبْدَأُ</span><p>Bedah I‘rab · Belajar Nahwu dengan memahami alasan.</p><span className="footer-version">PROTOTIPE 0.1.0</span></footer>
        </div>
      </section>
    </main>
  );
}
