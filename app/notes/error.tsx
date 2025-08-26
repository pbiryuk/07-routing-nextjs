'use client';

interface NotesErrorProps {
  error: Error;
}

export default function NotesError({ error }: NotesErrorProps) {
  return (
    <div
      style={{
        color: '#b00020',
        backgroundColor: '#fddede',
        padding: '12px 16px',
        borderRadius: '6px',
        fontWeight: 600,
        fontSize: '1rem',
        margin: '20px',
        textAlign: 'center',
        boxShadow: '0 2px 6px rgba(176, 0, 32, 0.3)',
      }}
    >
      <p>Could not fetch the list of notes. {error.message}</p>
    </div>
  );
}
