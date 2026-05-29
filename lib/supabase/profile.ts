import type { User } from '~/types/users';

import { createSupabaseServerClient } from './server';

export async function getCurrentProfile(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, email, avatar_url, role, status, joined_date')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !profile) {
    return {
      id: user.id,
      name:
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        user.email?.split('@')[0] ??
        'User',
      email: user.email ?? '',
      avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    };
  }

  const { data: memberships } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id);

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    role: profile.role ?? undefined,
    status: profile.status ?? undefined,
    joinedDate: profile.joined_date ?? undefined,
    teamIds: memberships?.map((m) => m.team_id) ?? [],
  };
}

export async function updateCurrentProfile(input: {
  name?: string;
  status?: User['status'];
}): Promise<User> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    })
    .eq('id', user.id)
    .select('id, name, email, avatar_url, role, status, joined_date')
    .single();

  if (error || !data) {
    throw new Error('Failed to update profile');
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    avatarUrl: data.avatar_url,
    role: data.role ?? undefined,
    status: data.status ?? undefined,
    joinedDate: data.joined_date ?? undefined,
  };
}
