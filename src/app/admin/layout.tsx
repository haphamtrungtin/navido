import '../globals.css';
import './admin.css';
import type { Metadata } from 'next';
import { documentFontClassName } from '@/app/fonts';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Quản trị NAVIDO',
  robots: { index: false, follow: false },
};
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={documentFontClassName}>
        <main className="admin-shell">{children}</main>
      </body>
    </html>
  );
}
