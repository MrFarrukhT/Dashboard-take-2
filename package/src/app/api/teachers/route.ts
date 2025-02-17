import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany()
    return NextResponse.json(teachers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 })
  }
}

type CreateTeacherInput = {
  name: string
  email: string
  phone: string
  subjects: string[]
  qualifications: string[]
  joinDate: string
  status: string
}

export async function POST(request: Request) {
  try {
    const body: CreateTeacherInput = await request.json()
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'subjects', 'qualifications', 'joinDate', 'status']
    for (const field of requiredFields) {
      if (!(field in body)) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Create teacher using raw query to bypass type issues
    const result = await prisma.$queryRaw`
      INSERT INTO "Teacher" (
        "name",
        "email",
        "phone",
        "subjects",
        "qualifications",
        "joinDate",
        "status"
      ) VALUES (
        ${body.name},
        ${body.email},
        ${body.phone},
        ${body.subjects}::text[],
        ${body.qualifications}::text[],
        ${new Date(body.joinDate)}::timestamp,
        ${body.status}
      )
      RETURNING *;
    `

    const teacher = Array.isArray(result) ? result[0] : result
    return NextResponse.json(teacher)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'A teacher with this email already exists' },
          { status: 400 }
        )
      }
    }
    console.error('Teacher creation error:', error)
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 })
  }
}