import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where = category && category !== 'all' 
      ? { category: { equals: category } }
      : {}

    const content = await prisma.genZContent.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ 
      content,
      count: content.length 
    })
  } catch (error) {
    console.error('Error fetching Gen-Z content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      description, 
      content, 
      sourceName, 
      sourceUrl, 
      imageUrl, 
      publishedAt, 
      category, 
      tags,
      engagement = 0
    } = body

    const genZContent = await prisma.genZContent.create({
      data: {
        title,
        description,
        content,
        sourceName,
        sourceUrl,
        imageUrl,
        publishedAt: new Date(publishedAt),
        category,
        tags: tags || [],
        engagement
      }
    })

    return NextResponse.json({ content: genZContent }, { status: 201 })
  } catch (error) {
    console.error('Error creating Gen-Z content:', error)
    return NextResponse.json(
      { error: 'Failed to create content' },
      { status: 500 }
    )
  }
}