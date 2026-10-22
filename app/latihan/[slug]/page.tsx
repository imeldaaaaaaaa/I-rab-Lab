import PracticeWorkspace from "./practice-workspace";

export default async function PracticeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PracticeWorkspace slug={slug} />;
}
