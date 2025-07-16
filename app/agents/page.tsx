"use client";
export const dynamic = "force-dynamic";
import { redirect } from 'next/navigation';

export default function AgentsPage() {
  // Redirect to a default sub-page, e.g., a list of agent instances or templates
  redirect('/agents/instances'); // Assuming a page for listing instances will be created
}
