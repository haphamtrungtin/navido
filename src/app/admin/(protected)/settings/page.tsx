import { requireAdmin } from '@/features/admin-auth/access';
import { getOrderSettings } from '@/features/catalog/extensions/repository';
import { OrderSettingsForm } from '@/features/catalog/extensions/order-settings-form';
import { CatalogUnavailable } from '@/features/catalog/components/menu-list';
export default async function SettingsPage() {
  const admin = await requireAdmin();
  const settings = await getOrderSettings().catch(() => null);
  if (!settings) return <CatalogUnavailable />;
  return (
    <>
      <h1>Giờ nhận đơn</h1>
      <p>Cấu hình chuẩn bị cho checkout; chưa mở đặt hàng trong bước này.</p>
      <OrderSettingsForm owner={admin.role === 'owner'} settings={settings} />
    </>
  );
}
