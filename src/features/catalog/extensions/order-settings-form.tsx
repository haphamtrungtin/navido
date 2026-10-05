'use client';
import { useActionState, useState } from 'react';
import { saveOrderSettings, setOrdersPaused } from './actions';
import type { OrderSettings } from './schemas';
import type { ExtensionActionState } from './mutation';
import { MutationError } from '../components/form-fields';
const weekdays = [
  'Chủ nhật',
  'Thứ hai',
  'Thứ ba',
  'Thứ tư',
  'Thứ năm',
  'Thứ sáu',
  'Thứ bảy',
];
export function OrderSettingsForm({
  settings,
  owner,
}: {
  settings: OrderSettings;
  owner: boolean;
}) {
  return owner ? (
    <OwnerSettings settings={settings} />
  ) : (
    <PauseForm key={settings.version} settings={settings} />
  );
}
function PauseForm({ settings }: { settings: OrderSettings }) {
  const [state, action, pending] = useActionState<
    ExtensionActionState,
    FormData
  >(setOrdersPaused, { error: null });
  return (
    <section>
      <p>
        Nhận đơn:{' '}
        {settings.paused ? 'Tạm dừng' : 'Được phép trong lịch đã cấu hình'}
      </p>
      <p>
        Thời gian chuẩn bị: {settings.preparationMinutes} phút ·
        Asia/Ho_Chi_Minh
      </p>
      <ul>
        {settings.days.map((d) => (
          <li key={d.day}>
            {weekdays[d.day]}:{' '}
            {d.enabled
              ? `${d.start}–${d.end}; nhận cuối ${d.lastOrder}`
              : 'Đóng nhận đơn'}
          </li>
        ))}
      </ul>
      <form action={action} className="admin-form">
        <input type="hidden" name="expectedVersion" value={settings.version} />
        <input type="hidden" name="paused" value={String(!settings.paused)} />
        <MutationError state={state} />
        <button disabled={pending}>
          {settings.paused ? 'Cho phép nhận đơn' : 'Tạm dừng nhận đơn'}
        </button>
      </form>
    </section>
  );
}
function OwnerSettings({ settings }: { settings: OrderSettings }) {
  const [state, action, pending] = useActionState<
    ExtensionActionState,
    FormData
  >(saveOrderSettings, { error: null });
  const [initialVersion] = useState(settings.version);
  const [draft, setDraft] = useState(settings);
  return (
    <form action={action} className="admin-form">
      <p>
        Giờ nhận đơn riêng với giờ mở cửa website. Các khoảng qua nửa đêm chưa
        được hỗ trợ.
      </p>
      <input
        type="hidden"
        name="expectedVersion"
        value={state.savedVersion ?? initialVersion}
      />
      <input type="hidden" name="days" value={JSON.stringify(draft.days)} />
      <fieldset disabled={pending}>
        <label>
          Thời gian chuẩn bị (phút)
          <input
            name="preparationMinutes"
            type="number"
            min={1}
            max={180}
            step={1}
            required
            value={draft.preparationMinutes}
            onChange={(e) =>
              setDraft({ ...draft, preparationMinutes: Number(e.target.value) })
            }
          />
        </label>
        <label>
          <input
            type="checkbox"
            name="paused"
            checked={draft.paused}
            onChange={(e) => setDraft({ ...draft, paused: e.target.checked })}
          />
          Tạm dừng nhận đơn
        </label>
        {draft.days.map((day, index) => (
          <fieldset key={day.day}>
            <legend>{weekdays[day.day]}</legend>
            <label>
              <input
                type="checkbox"
                checked={day.enabled}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    days: draft.days.map((d, n) =>
                      n === index ? { ...d, enabled: e.target.checked } : d,
                    ),
                  })
                }
              />
              Mở nhận đơn
            </label>
            {(['start', 'lastOrder', 'end'] as const).map((field, n) => (
              <label key={field}>
                {['Bắt đầu phục vụ', 'Nhận đơn cuối', 'Kết thúc phục vụ'][n]}
                <input
                  type="time"
                  value={day[field]}
                  required
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      days: draft.days.map((d, i) =>
                        i === index ? { ...d, [field]: e.target.value } : d,
                      ),
                    })
                  }
                />
              </label>
            ))}
          </fieldset>
        ))}
      </fieldset>
      <MutationError state={state} />
      {state.savedVersion && state.error === null && (
        <p role="status">Đã lưu lịch.</p>
      )}
      <button disabled={pending}>Lưu lịch nhận đơn</button>
    </form>
  );
}
