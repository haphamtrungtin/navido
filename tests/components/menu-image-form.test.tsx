import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
import { MenuImageForm } from '@/features/catalog/images/image-form';
vi.mock('@/features/catalog/images/actions', () => ({
  selectMenuImageAsset: vi.fn(),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const asset = '/images/navido/menu/one.avif';
describe('image draft version and file lifecycle', () => {
  it('rebases an untouched image section but pins a selected file to its original version', () => {
    const props = {
      itemId: 'one',
      version: 2,
      imagePath: asset,
      assets: [asset],
    };
    const view = render(<MenuImageForm {...props} />);
    view.rerender(<MenuImageForm {...props} version={3} />);
    expect(
      view.container.querySelector('input[name="expectedVersion"]'),
    ).toHaveValue('3');
    fireEvent.change(screen.getByLabelText('Upload ảnh mới'), {
      target: { files: [new File(['png'], 'same.png', { type: 'image/png' })] },
    });
    view.rerender(<MenuImageForm {...props} version={4} />);
    expect(
      view.container.querySelector('input[name="expectedVersion"]'),
    ).toHaveValue('3');
  });
  it('retains an uploaded image as current selection and resets the native file input after upload', async () => {
    const path =
      '50000000-0000-0000-0000-000000000001/50000000-0000-0000-0000-000000000002.webp';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ version: 3, imagePath: path }),
      }),
    );
    const view = render(
      <MenuImageForm
        itemId="one"
        version={2}
        imagePath={path}
        assets={[asset]}
      />,
    );
    expect(screen.getByLabelText('Ảnh có sẵn')).toHaveValue(path);
    const input = screen.getByLabelText('Upload ảnh mới') as HTMLInputElement;
    Object.defineProperty(input, 'value', {
      configurable: true,
      writable: true,
      value: 'C:\\fakepath\\same.png',
    });
    fireEvent.change(input, {
      target: { files: [new File(['png'], 'same.png', { type: 'image/png' })] },
    });
    fireEvent.submit(
      screen
        .getByRole('button', { name: 'Upload và gắn ảnh' })
        .closest('form')!,
    );
    await waitFor(() =>
      expect(screen.getByText('Đã upload và gắn ảnh.')).toBeVisible(),
    );
    expect(input.value).toBe('');
    expect(
      view.container.querySelector('input[name="expectedVersion"]'),
    ).toHaveValue('3');
    vi.unstubAllGlobals();
  });
});
