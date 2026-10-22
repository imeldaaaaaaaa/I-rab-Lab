import contentPack from "@/content/bedah-irob-kurikulum-lengkap.json";

export type Analysis = {
  word: string;
  role: string;
  irob: string;
  sign: string;
  reason: string;
};

export type Material = {
  id?: string;
  slug: string;
  title: string;
  level: string;
  content: string;
  source_title: string | null;
  source_author: string | null;
  source_edition?: string | null;
  source_pages: string | null;
  status?: "draft" | "published";
};

export type Question = {
  id?: string;
  slug: string;
  title: string;
  sentence: string;
  translation: string | null;
  analyses: Analysis[];
  difficulty: string;
  material_slug?: string;
  source_pages?: string | null;
  status?: "draft" | "published";
};

export type ContentPack = {
  version: number;
  source: {
    title: string;
    author: string;
    editor?: string;
    publisher?: string;
    year?: number;
    note?: string;
  };
  materials: Material[];
  questions: Question[];
};

export const demoContent = contentPack as ContentPack;
export const demoMaterials = demoContent.materials;
export const demoQuestions = demoContent.questions;

export function formatSource(material: Partial<Material>) {
  const bits = [material.source_title, material.source_author, material.source_pages].filter(Boolean);
  return bits.join(" · ");
}
