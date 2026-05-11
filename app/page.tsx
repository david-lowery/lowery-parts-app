import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-3xl font-bold">Lowery Parts</h1>
        <p className="text-gray-600">Simple internal parts request system.</p>

        <Link
          href="/request"
          className="block w-full text-center rounded-xl bg-black text-white py-4 text-lg font-semibold"
        >
          Request a Part
        </Link>

        <Link
          href="/admin"
          className="block w-full text-center rounded-xl border py-4 text-lg font-semibold"
        >
          Admin Dashboard
        </Link>
      </div>
    </main>
  );
}
