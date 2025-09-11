'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export async function createTenant(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string

  await prisma.tenant.create({
    data: {
      name,
      email,
    },
  })

  revalidatePath('/tenants')
}
