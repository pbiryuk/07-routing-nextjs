'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import NoteList from '@/components/NoteList/NoteList';
import SearchBox from '@/components/SearchBox/SearchBox';
import Pagination from '@/components/Pagination/Pagination';
import Modal from '@/components/Modal/Modal';
import NoteForm from '@/components/NoteForm/NoteForm';
import Loader from '@/components/Loading/Loading';
import ErrorMessage from '@/components/ErrorMessage/ErrorMessage';
import { fetchNotes } from '@/lib/api';
import type { Note } from '@/types/note';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import css from './NotesPage.module.css';

interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export default function NotesClient() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearchTerm = useDebouncedValue(searchTerm, 500);

  const { data, isLoading, isError, error } = useQuery<
    FetchNotesResponse,
    Error
  >({
    queryKey: ['notes', debouncedSearchTerm, page],
    queryFn: () =>
      fetchNotes({
        page,
        perPage: 12,
        search: debouncedSearchTerm,
      }),
    placeholderData: keepPreviousData,
  });

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleSearchChange = (value: string) => {
    setPage(1);
    setSearchTerm(value);
  };

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
      {data && data.notes.length > 0 && <NoteList notes={data.notes} />}

      {isModalOpen && (
        <Modal isOpen={true} onClose={() => setIsModalOpen(false)}>
          <NoteForm
            initialValues={{ title: '', content: '', tag: 'Todo' }}
            onCancel={() => setIsModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
