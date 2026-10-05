import {
  cleanup,
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
afterEach(cleanup);
import { ItemExtensionsForm } from '@/features/catalog/extensions/item-extensions-form';
import { OrderSettingsForm } from '@/features/catalog/extensions/order-settings-form';
const save = vi.hoisted(() => vi.fn());
vi.mock('@/features/catalog/extensions/actions', () => ({
  saveItemExtensions: save,
  saveOrderSettings: vi.fn(),
  setOrdersPaused: vi.fn(),
}));
describe('catalog extension forms', () => {
  it('rebases an untouched extension section after another section saves', () => {
    const props = {
      itemId: 'new',
      version: 2,
      description: { vi: 'Original', en: '', ko: '' },
      groups: [],
    };
    const view = render(<ItemExtensionsForm {...props} />);
    view.rerender(<ItemExtensionsForm {...props} version={3} />);
    expect(
      view.container.querySelector('input[name="expectedVersion"]'),
    ).toHaveValue('3');
  });
  it('adds a group and retains the full draft after a conflict', async () => {
    save.mockResolvedValue({ error: 'conflict' });
    render(
      <ItemExtensionsForm
        itemId="new"
        version={2}
        description={{ vi: '', en: '', ko: '' }}
        groups={[]}
      />,
    );
    fireEvent.change(screen.getByLabelText('Mô tả VI'), {
      target: { value: 'Draft' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm nhóm' }));
    fireEvent.change(screen.getByLabelText('Tên nhóm VI'), {
      target: { value: 'Size' },
    });
    fireEvent.submit(
      screen
        .getByRole('button', { name: 'Lưu mô tả và tùy chọn' })
        .closest('form')!,
    );
    await waitFor(() => expect(screen.getByText(/đã thay đổi/i)).toBeVisible());
    expect(screen.getByLabelText('Mô tả VI')).toHaveValue('Draft');
    expect(screen.getByLabelText('Tên nhóm VI')).toHaveValue('Size');
  });
  it('keeps the version owned by the draft through external refreshes', () => {
    const props = {
      itemId: 'new',
      version: 2,
      description: { vi: 'Draft', en: '', ko: '' },
      groups: [],
    };
    const view = render(<ItemExtensionsForm {...props} />);
    fireEvent.change(screen.getByLabelText('Mô tả VI'), {
      target: { value: 'Unsaved' },
    });
    view.rerender(<ItemExtensionsForm {...props} version={5} />);
    expect(
      view.container.querySelector('input[name="expectedVersion"]'),
    ).toHaveValue('2');
  });
  it('staff can pause but cannot edit the schedule', () => {
    render(
      <OrderSettingsForm
        owner={false}
        settings={{
          version: 1,
          preparationMinutes: 20,
          paused: true,
          days: Array.from({ length: 7 }, (_, day) => ({
            day,
            enabled: false,
            start: '07:00',
            lastOrder: '21:30',
            end: '22:00',
          })),
        }}
      />,
    );
    expect(
      screen.queryByRole('button', { name: 'Lưu lịch nhận đơn' }),
    ).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Cho phép nhận đơn' }),
    ).toBeVisible();
    expect(screen.queryByLabelText('Thời gian chuẩn bị (phút)')).toBeNull();
  });
});
