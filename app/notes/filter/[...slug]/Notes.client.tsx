'use client';

import { useState, useEffect } from 'react';
import {
  useQuery,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';

import NoteList from '@/components/NoteList/NoteList';
import SearchBox from '@/components/SearchBox/SearchBox';
import Pagination from '@/components/Pagination/Pagination';
import Modal from '@/components/Modal/Modal';
import NoteForm from '@/components/NoteForm/NoteForm';
import Loader from '@/components/Loading/Loading';
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage';
import NotePreview from '@/app/@modal/(.)notes/[id]/NotePreview.client';
import { fetchNotes, fetchNoteById } from '@/lib/api';
import type { Note } from '@/types/note';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import css from './NotesPage.module.css';

interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

interface NotesClientProps {
  initialTag: string;
  initialData: FetchNotesResponse;
}

export default function NotesClient({
  initialTag,
  initialData,
}: NotesClientProps) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewNoteId, setPreviewNoteId] = useState<string | null>(null);

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 500);
  const queryClient = useQueryClient();

  useEffect(() => {
    setPage(1);
  }, [initialTag]);

  const { data, isLoading, isError, error } = useQuery<
    FetchNotesResponse,
    Error
  >({
    queryKey: ['notes', initialTag, debouncedSearchTerm, page],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: 12,
        search: debouncedSearchTerm,
        tag: initialTag === 'All' ? undefined : initialTag,
      }),
    placeholderData: keepPreviousData,
    initialData,
  });

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleSearchChange = (value: string) => {
    setPage(1);
    setSearchTerm(value);
  };

  const handleNoteClick = async (id: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['note', id],
      queryFn: () => fetchNoteById(id),
    });
    setPreviewNoteId(id);
  };

  const closePreview = () => setPreviewNoteId(null);

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={searchTerm} onChange={handleSearchChange} />
        {data && data.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={handlePageChange}
          />
        )}
        <button className={css.button} onClick={() => setIsModalOpen(true)}>
          Create note +
        </button>
      </header>

      {isLoading && <Loader />}
      {isError && (
        <ErrorMessage message={error?.message || 'Error loading notes'} />
      )}
      {data && data.notes.length > 0 && (
        <NoteList notes={data.notes} onNoteClick={handleNoteClick} />
      )}

      {data && data.notes.length === 0 && <p>No notes found.</p>}

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <NoteForm
            initialValues={{ title: '', content: '', tag: 'Todo' }}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}

      {previewNoteId && (
        <Modal isOpen={true} onClose={closePreview}>
          <NotePreview id={previewNoteId} />
        </Modal>
      )}
    </div>
  );
}
