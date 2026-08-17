import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import type { JesusReference } from '@/services/types';

/**
 * Open a structured scripture reference in the reader.
 *
 * The Jesus feature stores references structurally (book id + chapter), so
 * unlike the topics screen there is nothing to regex out of a display string —
 * we can dispatch the passage directly and land the reader on the right
 * chapter, with the right book id, first time.
 */
export function useOpenReference() {
  const { dispatch } = useApp();
  const navigate = useNavigate();

  return useCallback(
    (ref: Pick<JesusReference, 'book_id' | 'book_name' | 'chapter'>) => {
      dispatch({
        type: 'SET_PASSAGE',
        book: ref.book_name,
        chapter: ref.chapter,
        bookId: ref.book_id,
      });
      navigate('/read');
    },
    [dispatch, navigate],
  );
}
