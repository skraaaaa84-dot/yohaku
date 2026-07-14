-- 余白「編集室」用テーブル
create table if not exists public.editorial_settings (
  id bigint generated always as identity primary key,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  title text not null default 'この場所は、まだ始まったばかりです。',
  body text not null default 'うまく言えなかったことも、誰にも見せられなかった言葉も、ここでは急がなくて大丈夫です。',
  weekly_theme text not null default '窓',
  theme_note text not null default '窓の向こうに見えたもの、窓越しに言えなかったこと。',
  selected_poem_id bigint references public.poems(id) on delete set null,
  closing_message text not null default '今日も、誰かの言葉が、誰かを少しだけ救っていますように。'
);

alter table public.editorial_settings enable row level security;

drop policy if exists "public read editorial settings"
on public.editorial_settings;

create policy "public read editorial settings"
on public.editorial_settings
for select
to anon, authenticated
using (true);

grant select on public.editorial_settings to anon, authenticated;

insert into public.editorial_settings
(title, body, weekly_theme, theme_note, closing_message)
select
  'この場所は、まだ始まったばかりです。',
  E'うまく言えなかったことも、誰にも見せられなかった言葉も、ここでは急がなくて大丈夫です。\n\nあなたの一首を、静かにお待ちしています。',
  '窓',
  '窓の向こうに見えたもの、窓越しに言えなかったこと。',
  E'今日も、誰かの言葉が、\n誰かを少しだけ救っていますように。'
where not exists (
  select 1 from public.editorial_settings
);
