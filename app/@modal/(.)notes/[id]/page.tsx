'use client';

import {
  QueryClient,
  QueryClientProvider,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query';
import NotePreview from './NotePreview.client';
import { fetchNoteById } from '@/lib/api';
import { useState, useEffect } from 'react';
import React from 'react';

interface NotePageProps {
  params: Promise<{ id: string }>;
}

export default function NotePage({ params }: NotePageProps) {
  const { id } = React.use(params); //
  const [queryClient] = useState(() => new QueryClient());
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const prefetch = async () => {
      await queryClient.prefetchQuery({
        queryKey: ['note', id],
        queryFn: () => fetchNoteById(id),
        staleTime: 1000 * 60 * 5,
      });
      setIsHydrated(true);
    };
    prefetch();
  }, [id, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {isHydrated ? (
        <HydrationBoundary state={dehydrate(queryClient)}>
          <NotePreview id={id} />
        </HydrationBoundary>
      ) : (
        <p>Loading...</p>
      )}
    </QueryClientProvider>
  );
}
