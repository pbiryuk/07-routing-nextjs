import NotesClient from './Notes.client';
import { fetchNotes, type FetchNotesResponse } from '@/lib/api';

interface NotesPageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function NotesPage({ params }: NotesPageProps) {
  const { slug } = await params;
  const tagFromSlug = slug?.[0] ?? 'All';
  const category = tagFromSlug === 'All' ? undefined : tagFromSlug;

  const initialNotes: FetchNotesResponse = await fetchNotes({
    page: 1,
    perPage: 12,
    tag: category,
  });

  return <NotesClient initialTag={tagFromSlug} initialData={initialNotes} />;
}
