import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
const access = vi.hoisted(() => ({ status: 'unauthenticated' }));
vi.mock('@/features/admin-auth/access', () => ({
  getAdminAccess: async () => access,
}));
vi.mock('@/features/admin-auth/components/logout-form', () => ({
  LogoutForm: () => <button>Đăng xuất</button>,
}));
vi.mock('next/navigation', () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  },
}));
import ProtectedLayout from '@/app/admin/(protected)/layout';
afterEach(cleanup);
describe('protected admin page boundary', () => {
  it('redirects unauthenticated requests to the fixed login route', async () => {
    access.status = 'unauthenticated';
    await expect(
      ProtectedLayout({ children: <p>Private data</p> }),
    ).rejects.toThrow('redirect:/admin/login');
  });
  it.each([
    ['forbidden', 'Chưa có quyền quản trị'],
    ['unavailable', 'Dịch vụ tạm thời không khả dụng'],
  ])('fails closed for %s', async (status, message) => {
    access.status = status;
    render(await ProtectedLayout({ children: <p>Private data</p> }));
    expect(screen.getByRole('heading')).toHaveTextContent(message);
    expect(screen.queryByText('Private data')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Đăng xuất' }),
    ).toBeInTheDocument();
  });
});
