'use client';
import { useActionState } from 'react';
import { signOutAdmin } from '../actions';
export function LogoutForm() {
  const [state, action, pending] = useActionState(signOutAdmin, {
    error: null,
  });
  return (
    <form action={action}>
      <button disabled={pending}>
        {pending ? 'Đang đăng xuất…' : 'Đăng xuất'}
      </button>
      {state.error && (
        <p role="alert">
          Chưa xác nhận được việc thu hồi phiên. Vui lòng thử đăng xuất lại.
        </p>
      )}
    </form>
  );
}
