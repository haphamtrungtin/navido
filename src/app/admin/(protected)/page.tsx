import Link from 'next/link';
import { getAdminAccess } from '@/features/admin-auth/access';
export default async function AdminPage() {
  const access = await getAdminAccess();
  if (access.status !== 'allowed') return null;
  return (
    <>
      <h1>Quản trị NAVIDO</h1>
      <p>
        {access.actor.email} ·{' '}
        {access.actor.role === 'owner' ? 'Chủ quán' : 'Nhân viên'}
      </p>
      <section className="admin-card">
        <h2>Kết nối database</h2>
        <p>Đã xác minh tài khoản và đọc quyền từ database thành công.</p>
        <Link className="admin-button" href="/admin/menu">
          Quản lý menu
        </Link>
      </section>
    </>
  );
}
