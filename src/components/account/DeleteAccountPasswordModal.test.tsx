import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeleteAccountPasswordModal } from './DeleteAccountPasswordModal';

function open(passwordOptional: boolean) {
  const onConfirm = vi.fn();
  render(
    <DeleteAccountPasswordModal visible onCancel={vi.fn()} onConfirm={onConfirm} isLoading={false} passwordOptional={passwordOptional} />,
  );
  return onConfirm;
}

describe('the password step of account deletion', () => {
  it('lets an account whose password state is unknown confirm with an empty password, and says so', () => {
    const onConfirm = open(true);
    expect(screen.getByText(/leave this empty/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /continue|confirm|delete/i }));
    expect(onConfirm).toHaveBeenCalledWith('');
  });

  it('requires the password otherwise', () => {
    const onConfirm = open(false);
    expect(screen.queryByText(/leave this empty/i)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /continue|confirm|delete/i }));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
