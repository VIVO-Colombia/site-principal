#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DB_NAME="${PLANEADOR_TEST_DB:-planeador_integration}"
PSQL_BASE=(psql --set ON_ERROR_STOP=1 --quiet)

if [[ -n "${DATABASE_URL:-}" && -z "${PLANEADOR_USE_LOCAL_PG:-}" ]]; then
  echo "Refusing to run mutating integration tests against DATABASE_URL."
  echo "This harness creates a local database named ${DB_NAME}."
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "SKIP: psql is not installed"
  exit 2
fi

drop_db() {
  dropdb --if-exists "$DB_NAME" >/dev/null 2>&1 || true
}

create_db() {
  createdb "$DB_NAME"
}

if ! create_db; then
  if command -v sudo >/dev/null 2>&1; then
    sudo -u postgres createdb -O "$(whoami)" "$DB_NAME"
  else
    echo "SKIP: could not create database ${DB_NAME}"
    exit 2
  fi
fi

cleanup() {
  dropdb --if-exists "$DB_NAME" >/dev/null 2>&1 || sudo -u postgres dropdb --if-exists "$DB_NAME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

run_sql() {
  "${PSQL_BASE[@]}" -d "$DB_NAME" -f "$1"
}

echo "Applying harness and migrations to ${DB_NAME}"
run_sql "$ROOT/supabase/tests/harness.sql"
run_sql "$ROOT/supabase/migrations/0001_identity_and_billing.sql"
run_sql "$ROOT/supabase/migrations/0002_admin_functions.sql"
run_sql "$ROOT/supabase/migrations/0003_finance.sql"
run_sql "$ROOT/supabase/migrations/0004_rls.sql"
run_sql "$ROOT/supabase/migrations/0005_stabilization.sql"
echo "Re-applying 0005 to verify it is idempotent"
run_sql "$ROOT/supabase/migrations/0005_stabilization.sql"
run_sql "$ROOT/supabase/tests/grants.sql"
echo "Running integration assertions"
run_sql "$ROOT/supabase/tests/integration.sql"

before_profiles="$("${PSQL_BASE[@]}" -d "$DB_NAME" -tAc "select count(*) from public.profiles")"
before_cycles="$("${PSQL_BASE[@]}" -d "$DB_NAME" -tAc "select count(*) from public.financial_cycles")"
echo "Re-applying 0005 on a database that already contains rows"
run_sql "$ROOT/supabase/migrations/0005_stabilization.sql"
after_profiles="$("${PSQL_BASE[@]}" -d "$DB_NAME" -tAc "select count(*) from public.profiles")"
after_cycles="$("${PSQL_BASE[@]}" -d "$DB_NAME" -tAc "select count(*) from public.financial_cycles")"
if [[ "$before_profiles" != "$after_profiles" || "$before_cycles" != "$after_cycles" ]]; then
  echo "0005 changed row counts (profiles $before_profiles -> $after_profiles, cycles $before_cycles -> $after_cycles)"
  exit 1
fi
echo "0005 left existing row counts unchanged"
echo "SQL integration tests passed"
