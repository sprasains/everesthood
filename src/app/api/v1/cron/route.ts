import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

const cronJobs = [
  { name: "assign-badges", path: "/api/v1/cron/assign-badges" },
  { name: "fetch-news", path: "/api/v1/cron/fetch-news" },
  { name: "fetch-genz", path: "/api/v1/cron/fetch-genz" },
  { name: "fetch-jobs", path: "/api/v1/cron/fetch-jobs" },
];

export async function POST() {
  const results = [];
  for (const job of cronJobs) {
    let status = "success";
    let error = null;
    try {
      const res = await fetch(job.path, { method: "POST" });
      if (!res.ok) status = `error: ${res.status}`;
    } catch (e: any) {
      status = "error";
      error = e.message;
    }
    results.push({ job: job.name, status, error });
    // Write to DB log
    await prisma.cronJobLog.create({
      data: {
        job: job.name,
        status,
        error,
        runAt: new Date(),
      },
    });
  }
  return NextResponse.json({ results });
} 