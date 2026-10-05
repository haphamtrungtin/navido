import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
vi.mock('@/features/admin-auth/actions', () => ({
  signInAdmin: async () => ({ error: 'invalid_credentials' }),
  signOutAdmin: async () => ({ error: 'unavailable' }),
}));
import { LoginForm } from '@/features/admin-auth/components/login-form';
import { LogoutForm } from '@/features/admin-auth/components/logout-form';
afterEach(cleanup);
describe('staff authentication forms', () => {
  it('labels credentials and exposes a generic accessible error', async () => {
    render(<LoginForm />);
    await userEvent.type(screen.getByLabelText('Email'), 'owner@example.test');
    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Email hoặc mật khẩu không đúng',
    );
  });
  it('offers retry when logout cannot be confirmed', async () => {
    render(<LogoutForm />);
    await userEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Chưa xác nhận được việc thu hồi phiên',
    );
    expect(screen.getByRole('button', { name: 'Đăng xuất' })).toBeEnabled();
  });
});
