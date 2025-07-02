import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const apiKey = process.env.JSEARCH_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'JSEARCH_API_KEY not set' }, { status: 500 });
  }
  const { searchParams } = new URL(req.url);
  const job_title = searchParams.get('job_title');
  const location = searchParams.get('location');
  if (!job_title || !location) {
    return NextResponse.json({ error: 'Missing job_title or location' }, { status: 400 });
  }
  const url = `https://jsearch.p.rapidapi.com/estimated-salary?job_title=${encodeURIComponent(job_title)}&location=${encodeURIComponent(location)}&location_type=ANY&years_of_experience=ALL`;
  try {
    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: 'Failed to fetch salary', details: errorText }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Error fetching salary', details: e instanceof Error ? e.message : e }, { status: 500 });
  }
} 