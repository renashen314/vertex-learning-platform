import { VertexLogo } from "@/components/logo";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center min-h-screen bg-neutral-50">
      <div className="flex flex-col items-center gap-4">
        <VertexLogo size={48} />
        <span className="font-display text-display-2 font-bold text-neutral-900">
          Vertex
        </span>
        <p className="text-body-lg text-neutral-500">Coming soon</p>
      </div>
    </main>
  );
}
