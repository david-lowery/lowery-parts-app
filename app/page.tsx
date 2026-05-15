"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-xl mx-auto space-y-6">

        <div className="flex justify-center">
          <Image
            src="/lowery-logo.jpeg"
            alt="Lowery"
            width={380}
            height={180}
            className="rounded-3xl"
          />
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold">
            Lowery Parts App
          </h1>

          <p className="text-gray-600 mt-2">
            Submit and track part requests.
          </p>
        </div>

        <div className="grid gap-4">

          <Link
            href="/request"
            className="rounded-2xl bg-black text-white text-center p-6 text-2xl font-bold shadow"
          >
            Request a Part
          </Link>

          <Link
            href="/my-requests"
            className="rounded-2xl border text-center p-6 text-2xl font-bold shadow bg-white"
          >
            My Requests
          </Link>

        </div>

      </div>
    </main>
  );
}
