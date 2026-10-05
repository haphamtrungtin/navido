'use client';
import { useActionState, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { selectMenuImageAsset } from './actions';
import type { ExtensionActionState } from '../extensions/mutation';
import { MutationError } from '../components/form-fields';
export function MenuImageForm(props: {
  itemId: string;
  version: number;
  imagePath: string | null;
  assets: string[];
}) {
  return <ImageFields key={props.itemId} {...props} />;
}
function ImageFields({
  itemId,
  version,
  imagePath,
  assets,
}: {
  itemId: string;
  version: number;
  imagePath: string | null;
  assets: string[];
}) {
  const [state, action, pending] = useActionState<
    ExtensionActionState,
    FormData
  >(selectMenuImageAsset, { error: null });
  const [draftVersion, setDraftVersion] = useState(version);
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<ExtensionActionState>({
    error: null,
  });
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(imagePath ?? '');
  const fileInput = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const currentVersion = Math.max(draftVersion, state.savedVersion ?? 0);
  if (
    !pending &&
    !uploading &&
    !file &&
    version > currentVersion &&
    selected === (imagePath ?? '')
  )
    setDraftVersion(version);
  return (
    <section className="admin-form">
      <h2>Ảnh món</h2>
      <p>
        Ảnh không bắt buộc. Upload JPEG/PNG/WebP tối đa 3 MiB; ảnh được chuẩn
        hóa trước khi lưu.
      </p>
      {imagePath && <p>Ảnh hiện tại: {imagePath.split('/').pop()}</p>}
      <form action={action} className="admin-form">
        <input type="hidden" name="id" value={itemId} />
        <input type="hidden" name="expectedVersion" value={currentVersion} />
        <label>
          Ảnh có sẵn
          <select
            name="imagePath"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            disabled={pending || uploading}
          >
            <option value="">Không có ảnh</option>
            {selected && !assets.includes(selected) && (
              <option value={selected}>Ảnh đã upload hiện tại</option>
            )}
            {assets.map((path) => (
              <option key={path} value={path}>
                {path.split('/').pop()}
              </option>
            ))}
          </select>
        </label>
        <MutationError state={state} />
        {state.savedVersion && state.error === null && (
          <p role="status">Đã lưu ảnh.</p>
        )}
        <button disabled={pending || uploading}>Lưu ảnh có sẵn</button>
      </form>
      <form
        className="admin-form"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!file) return;
          setUploading(true);
          setUploadState({ error: null });
          try {
            const response = await fetch('/api/admin/menu-image', {
              method: 'POST',
              headers: {
                'content-type': file.type,
                'x-item-id': itemId,
                'x-expected-version': String(currentVersion),
              },
              body: file,
            });
            const result = await response.json();
            if (!response.ok) {
              setUploadState({
                error: [
                  'invalid_input',
                  'forbidden',
                  'conflict',
                  'unavailable',
                  'not_found',
                ].includes(result.error)
                  ? result.error
                  : 'unavailable',
              });
              return;
            }
            if (
              !Number.isInteger(result.version) ||
              result.version <= currentVersion
            ) {
              setUploadState({ error: 'unavailable' });
              return;
            }
            setDraftVersion(result.version);
            setUploadState({ error: null, savedVersion: result.version });
            setFile(null);
            if (fileInput.current) fileInput.current.value = '';
            setSelected(result.imagePath);
            router.refresh();
          } catch {
            setUploadState({ error: 'unavailable' });
          } finally {
            setUploading(false);
          }
        }}
      >
        <label>
          Upload ảnh mới
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={pending || uploading}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <MutationError state={uploadState} />
        {uploadState.savedVersion && uploadState.error === null && (
          <p role="status">Đã upload và gắn ảnh.</p>
        )}
        <button disabled={!file || pending || uploading}>
          {uploading ? 'Đang upload…' : 'Upload và gắn ảnh'}
        </button>
      </form>
    </section>
  );
}
