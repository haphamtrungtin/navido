import { LoginForm } from '@/features/admin-auth/components/login-form';
export default function LoginPage() {
  return (
    <section className="admin-card">
      <small>NAVIDO · DÀNH CHO NHÂN VIÊN</small>
      <h1>Đăng nhập quản trị</h1>
      <p>Dùng tài khoản được chủ quán cấp quyền.</p>
      <LoginForm />
    </section>
  );
}
