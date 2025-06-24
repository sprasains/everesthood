import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = category && category !== 'all' 
      ? { category: { contains: category, mode: 'insensitive' as const } }
      : {}

    const articles = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ 
      articles,
      count: articles.length 
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, content, sourceName, imageUrl, publishedAt, url, category, tags } = body

    const article = await prisma.article.create({
      data: {
        title,
        description,
        content,
        sourceName,
        imageUrl,
        publishedAt: new Date(publishedAt),
        url,
        category,
        tags: tags || []
      }
    })

    return NextResponse.json({ article }, { status: 201 })
  } catch (error) {
    console.error('Error creating article:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}