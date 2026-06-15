'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireUser, updateCurrentProfile } from '~/lib/auth-server';

export async function updateProfileAction(formData: FormData) {
  await requireUser();

  const name = String(formData.get('name') ?? '').trim();
  if (!name) {
    throw new Error('Name is required');
  }

  await updateCurrentProfile({ name });
  revalidatePath('/account');
  revalidatePath('/', 'layout');
  redirect('/account');
}
