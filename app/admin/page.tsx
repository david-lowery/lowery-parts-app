"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Request = {
  id: string;
  employee_name_snapshot: string;
  location: string;
  quantity: number;
  submitted_part_number: string | null;
  final_part_number: string | null;
  description: string;
  machine_customer_job: string | null;
  urgency: string;
  status: string;
  admin_notes: string | null;
  photo_url: string | null;
  vendor: string | null;
  order_reference: string | null;
  created_at: string;
};

const statuses = ["new", "needs_research", "approved", "ordered", "received", "closed", "cancelled"];

function statusLabel(s: string) {
  return s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function urgencyColor(u: string) {
  switch (u?.toLowerCase()) {
    case "down machine":
      return "bg-red-100 text-red-700";

    case "needed soon":
      return "bg-orange-100 text-orange-700";

    case "stock":
      return "bg-green-100 text-green-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

function isPossibleDuplicate(current: Request, all: Request[]) {
  return all.some((r) => {
    if (r.id === current.id) return false;

    const sameEmployee =
      r.employee_name_snapshot === current.employee_name_snapshot;

    const samePart =
      current.submitted_part_number &&
      r.submitted_part_number === current.submitted_part_number;

    const sameDescription =
      current.description &&
      r.description.toLowerCase().trim() === current.description.toLowerCase().trim();

    return sameEmployee && (samePart || sameDescription);
  });
}

export default function AdminPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [hideClosed, setHideClosed] = useState(true);
  const [search, setSearch] = useState("");

  async function loadRequests() {
    setLoading(true);
    const { data, error } = await supabase
      .from("part_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setRequests(data);
    setLoading(false);
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateStatus(id: string, status: string) {
    const updates: any = { status, updated_at: new Date().toISOString() };
    if (status === "ordered") updates.ordered_at = new Date().toISOString();
    if (status === "received") updates.received_at = new Date().toISOString();
    if (status === "closed") updates.closed_at = new Date().toISOString();

    await supabase.from("part_requests").update(updates).eq("id", id);
    loadRequests();
  }

  async function quickUpdate(id: string, field: string, value: string) {
    await supabase.from("part_requests").update({ [field]: value || null, updated_at: new Date().toISOString() }).eq("id", id);
  }

  async function deleteRequest(id: string) {
  if (!confirm("Delete this request? This cannot be undone.")) return;

  await supabase.from("part_requests").delete().eq("id", id);
  loadRequests();
}

 return (

    <main className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        
        <div className="mb-4">
  <input
    type="text"
    placeholder="Search requests..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full rounded-xl border p-4 text-lg"
  />
</div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Review, order, receive, and close part requests.</p>
          </div>
          <Link href="/" className="rounded-xl border px-4 py-2">Home</Link>
        </div>

        {loading && <div className="bg-white rounded-xl p-4 shadow">Loading...</div>}

        {!loading && requests.length === 0 && (
          <div className="bg-white rounded-xl p-4 shadow">No requests yet.</div>
        )}
        
<label className="flex items-center gap-2 font-medium">
  <input
    type="checkbox"
    checked={hideClosed}
    onChange={(e) => setHideClosed(e.target.checked)}
  />
  Hide Closed Requests
</label>
        <div className="grid gap-4">
    {requests
  .filter((r) => !hideClosed || r.status !== "closed")
  .filter((r) => {
    const q = search.toLowerCase();

    return (
      r.employee_name_snapshot?.toLowerCase().includes(q) ||
      r.location?.toLowerCase().includes(q) ||
      r.submitted_part_number?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q) ||
      r.machine_customer_job?.toLowerCase().includes(q) ||
      r.urgency?.toLowerCase().includes(q) ||
      r.status?.toLowerCase().includes(q) ||
      r.vendor?.toLowerCase().includes(q) ||
      r.order_reference?.toLowerCase().includes(q)
    );
  })
  .map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow p-4 space-y-3">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <div className="text-xl font-bold">{r.employee_name_snapshot || "Unknown Employee"}</div>
                  
                  {isPossibleDuplicate(r, requests) && (
  <div className="mt-1 inline-block rounded-lg bg-yellow-100 px-2 py-1 text-sm font-semibold text-yellow-800">
    Possible Duplicate
  </div>
)}
                  <div className="text-gray-600">{r.location} • Qty {r.quantity} • {new Date(r.created_at).toLocaleString()}</div>
                </div>
                <select value={r.status} onChange={(e) => updateStatus(r.id, e.target.value)} className="rounded-xl border p-3 font-semibold">
                  {statuses.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 p-3">
                  <div className="font-semibold">Requested</div>
                  <div>Part #: {r.submitted_part_number || "Not provided"}</div>
                  <div>{r.description}</div>
               {r.machine_customer_job && (
  <div className="text-gray-600">Job: {r.machine_customer_job}</div>
)}

<div
  className={`inline-block rounded-lg border px-3 py-1 font-semibold ${urgencyColor(r.urgency)}`}
>
  Urgency: {statusLabel(r.urgency)}
</div>
                </div>
  {r.photo_url && (
  <button onClick={() => setSelectedPhoto(r.photo_url)} className="mt-4">
    <img
      src={r.photo_url}
      alt="Request photo"
      className="rounded-xl border max-h-64 object-contain cursor-pointer hover:opacity-80"
    />
  </button>
)}

                <div className="rounded-xl bg-gray-50 p-3 space-y-2">
                  <label className="block">
                    <span className="font-semibold">Final Part #</span>
                    <input defaultValue={r.final_part_number || ""} onBlur={(e) => quickUpdate(r.id, "final_part_number", e.target.value)} className="mt-1 w-full rounded-xl border p-2" />
                  </label>
                  <label className="block">
                    <span className="font-semibold">Vendor</span>
                    <input defaultValue={r.vendor || ""} onBlur={(e) => quickUpdate(r.id, "vendor", e.target.value)} className="mt-1 w-full rounded-xl border p-2" />
                  </label>
                  <label className="block">
                    <span className="font-semibold">Order Ref</span>
                    <input defaultValue={r.order_reference || ""} onBlur={(e) => quickUpdate(r.id, "order_reference", e.target.value)} className="mt-1 w-full rounded-xl border p-2" />
                  </label>
                </div>
              </div>

<div className="flex flex-wrap gap-2">
  {[
    ["needs_research", "Needs Research"],
    ["approved", "Approve"],
    ["ordered", "Ordered"],
    ["received", "Received"],
    ["closed", "Close"],
  ].map(([status, label]) => (
    <button
      key={status}
      onClick={() => updateStatus(r.id, status)}
      className={
        r.status === status
          ? "rounded-xl bg-black text-white px-3 py-2"
          : "rounded-xl border px-3 py-2"
      }
    >
      {label}
    </button>
  ))}
  <button
  onClick={() => deleteRequest(r.id)}
  className="rounded-xl border border-red-300 px-3 py-2 text-red-700"
>
  Delete
</button>
  
</div>
            </div>
          ))}
        </div>
      
</div>

 {selectedPhoto && (
  <div
    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    onClick={() => setSelectedPhoto(null)}
  >
    <img
      src={selectedPhoto}
      alt="Full size"
      className="max-w-full max-h-full rounded-xl"
    />
  </div>
)}

</main>
);
}
