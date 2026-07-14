-- 共鳴機能（すでに実行済みでも再実行できます）
create or replace function public.increment_poem_echo(poem_id_input bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.poems
  set echoes = coalesce(echoes, 0) + 1
  where id = poem_id_input;
end;
$$;

revoke all on function public.increment_poem_echo(bigint) from public;
grant execute on function public.increment_poem_echo(bigint) to anon, authenticated;
