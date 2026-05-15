import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      employeeName,
      location,
      quantity,
      partNumber,
      description,
      machineJob,
      urgency,
      notes,
    } = body;

    const data = await resend.emails.send({
      from: "Lowery Parts App <onboarding@resend.dev>",
      to: "david@lowerydist.com",
      subject: `New Part Request - ${employeeName}`,
      html: `
        <h2>New Part Request</h2>

        <p><strong>Employee:</strong> ${employeeName}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
        <p><strong>Part Number:</strong> ${partNumber}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Machine / Job:</strong> ${machineJob}</p>
        <p><strong>Urgency:</strong> ${urgency}</p>
        <p><strong>Notes:</strong> ${notes}</p>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Email failed to send" },
      { status: 500 }
    );
  }
}
