import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: "#22C55E" }}>
        404
      </p>
      <h1 className="text-4xl font-black mb-3" style={{ color: "var(--text-primary)" }}>
        Page not found
      </h1>
      <p className="mb-8 max-w-sm" style={{ color: "var(--text-muted)" }}>
        That page doesn't exist. Head back to the calculator.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl font-bold text-sm"
        style={{ background: "#22C55E", color: "#09090B" }}
      >
        Back to calculator
      </Link>
    </main>
  );
}
