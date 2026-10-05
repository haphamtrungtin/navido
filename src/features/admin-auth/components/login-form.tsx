'use client';
import { useActionState } from 'react';
import { signInAdmin } from '../actions';
const messages = {
  invalid_input: 'Vui lòng nhập email và mật khẩu hợp lệ.',
  invalid_credentials: 'Email hoặc mật khẩu không đúng.',
  forbidden: 'Tài khoản chưa được cấp quyền quản trị.',
  unavailable: 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại.',
};
export function LoginForm() {
  const [state, action, pending] = useActionState(signInAdmin, { error: null });
  return (
    <form action={action} className="admin-form">
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="username"
        required
        maxLength={254}
      />
      <label htmlFor="password">Mật khẩu</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        maxLength={1024}
      />
      {state.error && <p role="alert">{messages[state.error]}</p>}
      <button disabled={pending}>
        {pending ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </button>
    </form>
  );
}
