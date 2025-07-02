import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'JSEARCH_API_KEY not set' }, { status: 500 });
  }
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query') || 'AI Engineer OR Machine Learning Engineer';
  const location = searchParams.get('location') || '';
  const page = searchParams.get('page') || '1';
  const num_pages = searchParams.get('num_pages') || '1';
  const remote = searchParams.get('remote') || '';
  const job_type = searchParams.get('job_type') || '';
  const salary = searchParams.get('salary') || '';

  const url = 'https://jsearch.p.rapidapi.com/search';
  const params = new URLSearchParams({
    query,
    page,
    num_pages,
  });
  if (location) params.append('location', location);
  if (remote) params.append('remote', remote);
  if (job_type) params.append('job_type', job_type);
  if (salary) params.append('salary', salary);

  try {
    const res = await fetch(`${url}?${params.toString()}`, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: 'Failed to fetch jobs', details: errorText }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json({ jobs: data.data || [], meta: { total: data.total || 0, page: Number(page), num_pages: Number(num_pages) } });
  } catch (e) {
    return NextResponse.json({ error: 'Error fetching jobs', details: e instanceof Error ? e.message : e }, { status: 500 });
  }
} 