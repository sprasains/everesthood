import { NextRequest, NextResponse } from "next/server";

let healthMetrics = [
  { id: 1, metric: "Weight", value: 70, date: "2024-06-01" },
  { id: 2, metric: "Blood Pressure", value: 120, date: "2024-06-02" },
];

export async function GET() {
  return NextResponse.json({ items: healthMetrics });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const id = healthMetrics.length ? Math.max(...healthMetrics.map(d => d.id)) + 1 : 1;
  const metric = { ...data, id };
  healthMetrics.push(metric);
  return NextResponse.json(metric, { status: 201 });
}

export async function PUT(req: NextRequest, { params }: any) {
  const id = Number(params.id);
  const data = await req.json();
  healthMetrics = healthMetrics.map(d => (d.id === id ? { ...d, ...data } : d));
  return NextResponse.json(healthMetrics.find(d => d.id === id));
}

export async function DELETE(req: NextRequest, { params }: any) {
  const id = Number(params.id);
  healthMetrics = healthMetrics.filter(d => d.id !== id);
  return NextResponse.json({ success: true });
} 