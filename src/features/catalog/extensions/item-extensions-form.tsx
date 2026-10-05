'use client';
import { useActionState, useId, useState } from 'react';
import type { LocalizedText } from '@/i18n/types';
import type { OptionGroup } from './schemas';
import type { ExtensionActionState } from './mutation';
import { saveItemExtensions } from './actions';
import { MutationError } from '../components/form-fields';
type Props = {
  itemId: string;
  version: number;
  description: LocalizedText;
  groups: OptionGroup[];
};
export function ItemExtensionsForm(props: Props) {
  return <Fields key={props.itemId} {...props} />;
}
function Fields({
  itemId,
  version,
  description: initialDescription,
  groups: initialGroups,
}: Props) {
  const [state, action, pending] = useActionState<
    ExtensionActionState,
    FormData
  >(saveItemExtensions, { error: null });
  const [draftVersion, setDraftVersion] = useState(version);
  const [description, setDescription] = useState(initialDescription);
  const [groups, setGroups] = useState(initialGroups);
  const prefix = useId();
  const currentVersion = Math.max(draftVersion, state.savedVersion ?? 0);
  if (
    !pending &&
    version > currentVersion &&
    (['vi', 'en', 'ko'] as const).every(
      (locale) => description[locale].trim() === initialDescription[locale],
    ) &&
    JSON.stringify(groups) === JSON.stringify(initialGroups)
  )
    setDraftVersion(version);
  function patchGroup(index: number, patch: Partial<OptionGroup>) {
    setGroups(groups.map((g, n) => (n === index ? { ...g, ...patch } : g)));
  }
  return (
    <form action={action} className="admin-form">
      <h2>Mô tả và tùy chọn món</h2>
      <p>
        Chỉ cấu hình lựa chọn đã xác nhận với quán. Bản ghi Extras nguồn vẫn
        được giữ riêng.
      </p>
      <input type="hidden" name="id" value={itemId} />
      <input type="hidden" name="expectedVersion" value={currentVersion} />
      <input type="hidden" name="groups" value={JSON.stringify(groups)} />
      <fieldset disabled={pending}>
        {(['vi', 'en', 'ko'] as const).map((locale) => (
          <label key={locale} htmlFor={`${prefix}-description-${locale}`}>
            Mô tả {locale.toUpperCase()}
            <textarea
              id={`${prefix}-description-${locale}`}
              name={`description${locale.charAt(0).toUpperCase() + locale.slice(1)}`}
              maxLength={4000}
              value={description[locale]}
              onChange={(e) =>
                setDescription({ ...description, [locale]: e.target.value })
              }
            />
          </label>
        ))}
        {(!description.en || !description.ko) && description.vi && (
          <p>Bản dịch thiếu sẽ hiển thị tiếng Việt; cần rà soát.</p>
        )}
        {groups.map((group, index) => (
          <fieldset key={group.id} className="admin-card">
            <legend>Nhóm {index + 1}</legend>
            {(['vi', 'en', 'ko'] as const).map((locale) => (
              <label key={locale}>
                Tên nhóm {locale.toUpperCase()}
                <input
                  value={group.name[locale]}
                  maxLength={300}
                  onChange={(e) =>
                    patchGroup(index, {
                      name: { ...group.name, [locale]: e.target.value },
                    })
                  }
                />
              </label>
            ))}
            <label>
              <input
                type="checkbox"
                checked={group.active}
                onChange={(e) =>
                  patchGroup(index, { active: e.target.checked })
                }
              />
              Hiển thị nhóm
            </label>
            <label>
              Chọn tối thiểu
              <input
                type="number"
                min={0}
                max={20}
                value={group.minSelections}
                onChange={(e) =>
                  patchGroup(index, { minSelections: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Chọn tối đa
              <input
                type="number"
                min={1}
                max={20}
                value={group.maxSelections}
                onChange={(e) =>
                  patchGroup(index, { maxSelections: Number(e.target.value) })
                }
              />
            </label>
            <label>
              Thứ tự nhóm
              <input
                type="number"
                step={1}
                value={group.sortOrder}
                onChange={(e) =>
                  patchGroup(index, { sortOrder: Number(e.target.value) })
                }
              />
            </label>
            {group.choices.map((choice, ci) => (
              <fieldset key={choice.id}>
                <legend>Lựa chọn {ci + 1}</legend>
                {(['vi', 'en', 'ko'] as const).map((locale) => (
                  <label key={locale}>
                    Tên lựa chọn {locale.toUpperCase()}
                    <input
                      maxLength={300}
                      value={choice.name[locale]}
                      onChange={(e) =>
                        patchGroup(index, {
                          choices: group.choices.map((c, n) =>
                            n === ci
                              ? {
                                  ...c,
                                  name: { ...c.name, [locale]: e.target.value },
                                }
                              : c,
                          ),
                        })
                      }
                    />
                  </label>
                ))}
                <label>
                  Phụ phí (VND)
                  <input
                    type="number"
                    min={0}
                    max={2147483647}
                    step={1}
                    value={choice.priceVnd}
                    onChange={(e) =>
                      patchGroup(index, {
                        choices: group.choices.map((c, n) =>
                          n === ci
                            ? { ...c, priceVnd: Number(e.target.value) }
                            : c,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Thứ tự lựa chọn
                  <input
                    type="number"
                    step={1}
                    value={choice.sortOrder}
                    onChange={(e) =>
                      patchGroup(index, {
                        choices: group.choices.map((c, n) =>
                          n === ci
                            ? { ...c, sortOrder: Number(e.target.value) }
                            : c,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={choice.active}
                    onChange={(e) =>
                      patchGroup(index, {
                        choices: group.choices.map((c, n) =>
                          n === ci ? { ...c, active: e.target.checked } : c,
                        ),
                      })
                    }
                  />
                  Còn lựa chọn
                </label>
                <button
                  type="button"
                  onClick={() =>
                    patchGroup(index, {
                      choices: group.choices.filter((_, n) => n !== ci),
                    })
                  }
                >
                  Xóa lựa chọn
                </button>
              </fieldset>
            ))}
            <button
              type="button"
              disabled={group.choices.length >= 20}
              onClick={() =>
                patchGroup(index, {
                  choices: [
                    ...group.choices,
                    {
                      id: crypto.randomUUID(),
                      name: { vi: '', en: '', ko: '' },
                      priceVnd: 0,
                      sortOrder: group.choices.length,
                      active: true,
                    },
                  ],
                })
              }
            >
              Thêm lựa chọn
            </button>
            <button
              type="button"
              onClick={() => setGroups(groups.filter((_, n) => n !== index))}
            >
              Xóa nhóm
            </button>
          </fieldset>
        ))}
        <button
          type="button"
          disabled={groups.length >= 10}
          onClick={() =>
            setGroups([
              ...groups,
              {
                id: crypto.randomUUID(),
                name: { vi: '', en: '', ko: '' },
                minSelections: 0,
                maxSelections: 1,
                sortOrder: groups.length,
                active: false,
                choices: [],
              },
            ])
          }
        >
          Thêm nhóm
        </button>
      </fieldset>
      <MutationError state={state} />
      {state.savedVersion && state.error === null && (
        <p role="status">Đã lưu.</p>
      )}
      <button disabled={pending}>Lưu mô tả và tùy chọn</button>
    </form>
  );
}
