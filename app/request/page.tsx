"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Employee = {
  id: string;
  name: string;
  location: string;
};

export default function RequestPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [partNumber, setPartNumber] = useState("");
  const [description, setDescription] = useState("");
  const [machineJob, setMachineJob] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEmployees() {
      const { data, error } = await supabase
        .from("employees")
        .select("id,name,location")
        .eq("active", true)
        .order("name");

      if (!error && data) setEmployees(data);
    }

    loadEmployees();
  }, []);

  function selectedEmployee() {
    return employees.find((e) => e.id === employeeId);
  }

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const employee = selectedEmployee();

    if (!employee) {
      setError("Choose your name.");
      return;
    }

    if (!description.trim()) {
      setError("Tell us what part you need.");
      return;
    }

    setSubmitting(true);

    let photoUrl = "";

if (photo) {
  const fileExt = photo.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("part-request-photos")
    .upload(fileName, photo);

  if (uploadError) {
    setError(uploadError.message);
    setSubmitting(false);
    return;
  }

  const { data } = supabase.storage
    .from("part-request-photos")
    .getPublicUrl(fileName);

  photoUrl = data.publicUrl;
}

    const { error } = await supabase.from("part_requests").insert({
      employee_id: employee.id,
      employee_name_snapshot: employee.name,
      location,
      quantity,
      submitted_part_number: partNumber.trim() || null,
      description: description.trim(),
      machine_customer_job: machineJob.trim() || null,
      urgency,
      employee_notes: notes.trim() || null,
      photo_url: photoUrl || null,
      status: "new",
    });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    await fetch("/api/send-email", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    employeeName: emp?.name || "Unknown Employee",
    location,
    quantity,
    partNumber: partNumber.trim() || "Not provided",
    description: description.trim(),
    machineJob: machineJob.trim() || "Not provided",
    urgency,
    notes: notes.trim() || "None",
  }),
});
    
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
          <h1 className="text-3xl font-bold">Request Sent</h1>
          <p className="text-gray-600">David will review it.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setPartNumber("");
              setDescription("");
              setMachineJob("");
              setNotes("");
              setQuantity(1);
              setUrgency("normal");
            }}
            className="w-full rounded-xl bg-black text-white py-4 text-lg font-semibold"
          >
            Request Another Part
          </button>
          <Link href="/" className="block text-center underline">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  return (
  <>
    <div className="mb-4 flex justify-end">
      <a
        href="/"
        className="rounded-2xl border bg-white px-5 py-3 text-lg shadow"
      >
        Home
      </a>
    </div>
    
    <main className="min-h-screen p-4">
      <form onSubmit={submitRequest} className="max-w-xl mx-auto bg-white rounded-2xl shadow p-5 space-y-4">
        <div className="flex justify-center mb-6">
  <Image
    src="/lowery-logo.jpeg"
    alt="Lowery Logo"
    width={220}
    height={120}
    className="rounded-2xl"
    priority
  />
</div>
        <div>
          <h1 className="text-3xl font-bold">Request a Part</h1>
        </div>

        {error && <div className="rounded-xl bg-red-50 text-red-700 p-3">{error}</div>}

        <label className="block">
          <span className="font-semibold">Your Name</span>
          <select
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value);
              const emp = employees.find((x) => x.id === e.target.value);
              if (emp) setLocation(emp.location);
            }}
            className="mt-1 w-full rounded-xl border p-4 text-lg"
          >
            <option value="">Choose name</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="font-semibold">Location</span>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full rounded-xl border p-4 text-lg">
            <option>Amarillo</option>
            <option>Plainview</option>
            <option>Management</option>
          </select>
        </label>

        <label className="block">
          <span className="font-semibold">Quantity</span>
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="mt-1 w-full rounded-xl border p-4 text-lg" />
        </label>

        <label className="block">
          <span className="font-semibold">Part Number, if known</span>
          <input value={partNumber} onChange={(e) => setPartNumber(e.target.value)} placeholder="Optional" className="mt-1 w-full rounded-xl border p-4 text-lg" />
        </label>

        <label className="block">
          <span className="font-semibold">What do you need?</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Example: hose reel swivel leaking" className="mt-1 w-full rounded-xl border p-4 text-lg min-h-28" />
        </label>

        <label className="block">
          <span className="font-semibold">Machine / Customer / Job</span>
          <input value={machineJob} onChange={(e) => setMachineJob(e.target.value)} placeholder="Optional" className="mt-1 w-full rounded-xl border p-4 text-lg" />
        </label>

        <label className="block">
          <span className="font-semibold">Urgency</span>
          <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="mt-1 w-full rounded-xl border p-4 text-lg">
            <option value="normal">Normal</option>
            <option value="needed_soon">Needed Soon</option>
            <option value="down_machine">Down Machine</option>
          </select>
        </label>

        <label className="block">
          <span className="font-semibold">Notes</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional" className="mt-1 w-full rounded-xl border p-4 text-lg" />
        </label>

        <label className="block">
  <span className="font-semibold">Photo</span>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
    className="mt-1 w-full rounded-xl border p-3 text-lg"
  />
</label>
        <button disabled={submitting} className="w-full rounded-xl bg-black text-white py-4 text-lg font-semibold disabled:opacity-60">
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
   </main>
</>
);
}
