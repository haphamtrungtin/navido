import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getAdminAccess } from '@/features/admin-auth/access';
import { LogoutForm } from '@/features/admin-auth/components/logout-form';
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await getAdminAccess();
  if (access.status === 'unauthenticated') redirect('/admin/login');
  if (access.status !== 'allowed')
    return (
      <section>
        <h1>
          {access.status === 'forbidden'
            ? 'Chưa có quyền quản trị'
            : 'Dịch vụ tạm thời không khả dụng'}
        </h1>
        <p>
          {access.status === 'forbidden'
            ? 'Liên hệ chủ quán để kiểm tra quyền tài khoản.'
            : 'Vui lòng tải lại trang sau ít phút.'}
        </p>
        <LogoutForm />
      </section>
    );
  return (
    <>
      <nav aria-label="Quản trị">
        <Link href="/admin">NAVIDO Admin</Link>
        <Link href="/admin/menu">Menu</Link>
        <Link href="/admin/menu/categories">Danh mục</Link>
        <Link href="/admin/menu/preview">Xem trước</Link>
        <Link href="/admin/settings">Giờ nhận đơn</Link>
        <LogoutForm />
      </nav>
      {children}
    </>
  );
}
