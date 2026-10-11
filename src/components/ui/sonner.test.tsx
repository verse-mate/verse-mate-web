import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Toaster, toast } from './sonner';

describe('the toaster', () => {
  it('keeps toasts out of session replay', async () => {
    render(<Toaster />);
    act(() => {
      toast('Saved your note');
    });
    const message = await screen.findByText('Saved your note');
    expect(message.closest('.ph-no-capture')).not.toBeNull();
  });
});
