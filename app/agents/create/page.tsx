"use client";
export const dynamic = "force-dynamic";
import { redirect } from 'next/navigation';

export default function CreateAgentPage() {
  // Redirect to the templates create page since that's where agent creation happens
  redirect('/agents/templates/create');
} 