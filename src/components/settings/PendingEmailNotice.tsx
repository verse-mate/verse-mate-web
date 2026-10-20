import { vmTokens } from '@/styles/themeStyles';

export default function PendingEmailNotice({
  id,
  email,
  testId,
}: {
  id: string;
  email: string | null | undefined;
  testId: string;
}) {
  return (
    <p
      id={id}
      role="status"
      data-testid={email ? testId : undefined}
      style={{ margin: email ? '6px 0 0' : 0, fontSize: 12.5, lineHeight: 1.45, color: vmTokens.textSecondary }}
    >
      {email ? (
        <>
          Check <strong style={{ color: vmTokens.textPrimary, fontWeight: 600 }}>{email}</strong> for a message from us
          to finish changing your email.
        </>
      ) : null}
    </p>
  );
}
