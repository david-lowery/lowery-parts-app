"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Employee = {
  id: string;
  name: string;
  location: string;
};

type Request = {
  id: string;
  employee_id: string | null;
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

function statusLabel(s: string) {
  return s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MyRequestsPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadEmployees() {
      const { data } = await supabase
        .from("employees")
        .select("id,name,location")
        .eq("active", true)
        .order("name");

      if (data) setEmployees(data);
    }

    loadEmployees();
  }, []);

  useEffect(() => {
    async function loadRequests() {
      if (!employeeId) {
        setRequests([]);
        return;
      }

      setLoading(true);

      const emp = employees.find((e) => e.id === employeeId);

      const { data } = await supabase
        .from("part_requests")
        .select("*")
        .or(`employee_id.eq.${employeeId},employee_name_snapshot.eq.${emp?.name}`)
        .order("created_at", { ascending: false });

      if (data) setRequests(data);

      setLoading(false);
    }

    loadRequests();
  }, [employeeId, employees]);

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-xl mx-auto space-y-4">

        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Requests</h1>
            <p className="text-gray-600">
              Check status on your part requests.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl border px-4 py-2"
          >
            Home
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <label className="block">
            <span className="font-semibold">Your Name</span>

            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="mt-1 w-full rounded-xl border p-4 text-lg"
            >
              <option value="">Choose name</option>

              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} — {e.location}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && (
          <div className="bg-white rounded-xl shadow p-4">
            Loading...
          </div>
        )}

        {!loading && employeeId && requests.length === 0 && (
          <div className="bg-white rounded-xl shadow p-4">
            No requests found.
          </div>
        )}

        <div className="grid gap-4">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl shadow p-4 space-y-3"
            >
              <div className="flex justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xl font-bold">
                    {statusLabel(r.status)}
                  </div>

                  <div className="text-gray-600">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="rounded-xl bg-gray-100 px-3 py-2 font-semibold">
                  Qty {r.quantity}
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-3 space-y-1">
                <div className="font-semibold">Requested</div>

                <div>
                  Part #: {r.submitted_part_number || "Not provided"}
                </div>

                <div>{r.description}</div>

                {r.machine_customer_job && (
                  <div className="text-gray-600">
                    Job: {r.machine_customer_job}
                  </div>
                )}

                <div className="text-gray-600">
                  Urgency: {statusLabel(r.urgency)}
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-3 space-y-1">
                <div className="font-semibold">Order Info</div>

                <div>
                  Final Part #: {r.final_part_number || "Not added yet"}
                </div>

                <div>
                  Vendor: {r.vendor || "Not added yet"}
                </div>

                <div>
                  Order Ref: {r.order_reference || "Not added yet"}
                </div>

                {r.admin_notes && (
                  <div>
                    Notes: {r.admin_notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
