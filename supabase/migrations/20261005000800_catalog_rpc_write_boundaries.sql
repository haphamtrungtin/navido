-- New mutable aggregates are RPC-only, so every update requires a version.
revoke update on public.store_order_settings from authenticated;
drop policy owner_order_settings_update on public.store_order_settings;
-- Keep the original step-0 column API and its trigger protections. The new
-- description/options/image fields can only change through guarded RPCs.
revoke update on public.menu_items from authenticated;
grant update(id,category_id,name_vi,name_en,name_ko,price_vnd,sort_order,
  publication_status,is_available,source_row,source_name,source_category_code,
  needs_review,review_notes,net_weight_gram,version,created_at,updated_at,updated_by)
on public.menu_items to authenticated;
