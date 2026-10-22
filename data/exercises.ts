export type SourceType = 'Umum' | 'Teks klasik' | "Al-Qur'an";
export type WordKind = 'Isim' | 'Fi’il' | 'Huruf';
export type Position =
  | 'Fā‘il'
  | 'Mubtada’'
  | 'Khabar'
  | 'Maf‘ūl bih'
  | 'Isim إنّ'
  | 'Isim majrūr'
  | 'Na‘t'
  | 'Badal / ‘aṭaf bayān'
  | 'Fi’il māḍī'
  | 'Huruf jar'
  | 'Huruf lainnya';
export type CaseState = 'Marfū‘' | 'Manṣūb' | 'Majrūr' | 'Majzūm' | 'Mabnī' | 'Tidak berlaku';
export type Sign = 'Ḍammah' | 'Fatḥah' | 'Kasrah' | 'Sukūn' | 'Alif' | 'Wāw' | 'Yā’' | 'Mabnī' | 'Tidak berlaku';

export interface WordAnalysis {
  token: string;
  kind: WordKind;
  position: Position;
  state: CaseState;
  sign: Sign;
  explanation: string;
  fullIrab: string;
}

export interface Exercise {
  id: string;
  source: SourceType;
  title: string;
  sentence: string;
  translation: string;
  context: string;
  words: WordAnalysis[];
  reference?: string;
}

export const exercises: Exercise[] = [
  {
    id: 'general-01',
    source: 'Umum',
    title: 'Jumlah fi‘liyyah sederhana',
    sentence: 'كَتَبَ الطَّالِبُ الدَّرْسَ',
    translation: 'Siswa itu menulis pelajaran.',
    context: 'Latihan dasar untuk membedakan fi‘il, fā‘il, dan maf‘ūl bih.',
    words: [
      { token: 'كَتَبَ', kind: 'Fi’il', position: 'Fi’il māḍī', state: 'Mabnī', sign: 'Mabnī', explanation: 'Menunjukkan pekerjaan yang telah terjadi. Fi‘il māḍī bersifat mabnī; pada contoh ini mabnī ‘alā al-fatḥ.', fullIrab: 'كَتَبَ: فِعْلٌ مَاضٍ مَبْنِيٌّ عَلَى الْفَتْحِ.' },
      { token: 'الطَّالِبُ', kind: 'Isim', position: 'Fā‘il', state: 'Marfū‘', sign: 'Ḍammah', explanation: 'الطَّالِبُ adalah pelaku dari pekerjaan كَتَبَ. Fā‘il berstatus marfū‘ dan tanda asalnya ḍammah.', fullIrab: 'الطَّالِبُ: فَاعِلٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ عَلَى آخِرِهِ.' },
      { token: 'الدَّرْسَ', kind: 'Isim', position: 'Maf‘ūl bih', state: 'Manṣūb', sign: 'Fatḥah', explanation: 'الدَّرْسَ adalah sesuatu yang ditulis, sehingga berkedudukan sebagai maf‘ūl bih. Maf‘ūl bih berstatus manṣūb.', fullIrab: 'الدَّرْسَ: مَفْعُولٌ بِهِ مَنْصُوبٌ وَعَلَامَةُ نَصْبِهِ الْفَتْحَةُ الظَّاهِرَةُ عَلَى آخِرِهِ.' },
    ],
  },
  {
    id: 'classical-01',
    source: 'Teks klasik',
    title: 'Jumlah ismiyyah',
    sentence: 'الْعِلْمُ نَافِعٌ',
    translation: 'Ilmu itu bermanfaat.',
    context: 'Contoh bergaya teks pembelajaran klasik; bukan kutipan yang dinisbatkan kepada kitab tertentu.',
    words: [
      { token: 'الْعِلْمُ', kind: 'Isim', position: 'Mubtada’', state: 'Marfū‘', sign: 'Ḍammah', explanation: 'الْعِلْمُ menjadi pokok pembicaraan dalam jumlah ismiyyah, sehingga berkedudukan sebagai mubtada’ yang marfū‘.', fullIrab: 'الْعِلْمُ: مُبْتَدَأٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ عَلَى آخِرِهِ.' },
      { token: 'نَافِعٌ', kind: 'Isim', position: 'Khabar', state: 'Marfū‘', sign: 'Ḍammah', explanation: 'نَافِعٌ memberikan informasi tentang mubtada’. Khabar pada contoh ini marfū‘ dengan ḍammah.', fullIrab: 'نَافِعٌ: خَبَرٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ عَلَى آخِرِهِ.' },
    ],
  },
  {
    id: 'quran-01',
    source: "Al-Qur'an",
    title: 'Surah Al-Ikhlāṣ ayat 2',
    sentence: 'اللَّهُ الصَّمَدُ',
    translation: 'Allah tempat meminta segala sesuatu.',
    context: 'Potongan ayat dipilih untuk latihan mubtada’ dan khabar.',
    reference: 'QS. Al-Ikhlāṣ [112]: 2',
    words: [
      { token: 'اللَّهُ', kind: 'Isim', position: 'Mubtada’', state: 'Marfū‘', sign: 'Ḍammah', explanation: 'Lafẓ al-jalālah menjadi mubtada’ dalam jumlah ismiyyah dan berstatus marfū‘.', fullIrab: 'اللَّهُ: لَفْظُ الْجَلَالَةِ مُبْتَدَأٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ.' },
      { token: 'الصَّمَدُ', kind: 'Isim', position: 'Khabar', state: 'Marfū‘', sign: 'Ḍammah', explanation: 'الصَّمَدُ merupakan khabar yang melengkapi makna mubtada’. Tanda rafa‘-nya adalah ḍammah yang tampak.', fullIrab: 'الصَّمَدُ: خَبَرٌ مَرْفُوعٌ وَعَلَامَةُ رَفْعِهِ الضَّمَّةُ الظَّاهِرَةُ.' },
    ],
  },
];

export const wordKinds: WordKind[] = ['Isim', 'Fi’il', 'Huruf'];
export const positions: Position[] = ['Fā‘il', 'Mubtada’', 'Khabar', 'Maf‘ūl bih', 'Isim إنّ', 'Isim majrūr', 'Na‘t', 'Badal / ‘aṭaf bayān', 'Fi’il māḍī', 'Huruf jar', 'Huruf lainnya'];
export const caseStates: CaseState[] = ['Marfū‘', 'Manṣūb', 'Majrūr', 'Majzūm', 'Mabnī', 'Tidak berlaku'];
export const signs: Sign[] = ['Ḍammah', 'Fatḥah', 'Kasrah', 'Sukūn', 'Alif', 'Wāw', 'Yā’', 'Mabnī', 'Tidak berlaku'];
