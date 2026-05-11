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
  vendor: string | null;
  order_reference: string | null;
  created_at: string;
};

const statuses = ["new", "needs_research", "approved", "ordered", "received", "closed", "cancelled"];

function statusLabel(s: string) {
  return s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-4">
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

        <div className="grid gap-4">
          {requests.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl shadow p-4 space-y-3">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <div className="text-xl font-bold">{r.employee_name_snapshot || "Unknown Employee"}</div>
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
                  {r.machine_customer_job && <div className="text-gray-600">Job: {r.machine_customer_job}</div>}
                  <div className="text-gray-600">Urgency: {statusLabel(r.urgency)}</div>
                </div>

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
                <button onClick={() => updateStatus(r.id, "needs_research")} className="rounded-xl border px-3 py-2">Needs Research</button>
                <button onClick={() => updateStatus(r.id, "approved")} className="rounded-xl border px-3 py-2">Approve</button>
                <button onClick={() => updateStatus(r.id, "ordered")} className="rounded-xl bg-black text-white px-3 py-2">Ordered</button>
                <button onClick={() => updateStatus(r.id, "received")} className="rounded-xl border px-3 py-2">Received</button>
                <button onClick={() => updateStatus(r.id, "closed")} className="rounded-xl border px-3 py-2">Close</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
