'use client'

import { useEffect, useState } from 'react'
import { Teacher } from '@/mock/data'

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])

  useEffect(() => {
    async function fetchTeachers() {
      try {
        const response = await fetch('/api/teachers')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setTeachers(data)
      } catch (error) {
        console.error('Error:', error)
      }
    }
    fetchTeachers()
  }, [])

  return (
    <div>
      {teachers.map((teacher) => (
        <div key={teacher.id}>
          <h3>{teacher.name}</h3>
          <p>{teacher.email}</p>
        </div>
      ))}
    </div>
  )
}