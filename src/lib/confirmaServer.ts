import { createClient } from "@supabase/supabase-js";

const confirmaUrl =
  process.env.CONFIRMA_SUPABASE_URL;

const confirmaServiceRoleKey =
  process.env.CONFIRMA_SUPABASE_SERVICE_ROLE_KEY;

if (!confirmaUrl) {
  throw new Error(
    "Missing CONFIRMA_SUPABASE_URL"
  );
}

if (!confirmaServiceRoleKey) {
  throw new Error(
    "Missing CONFIRMA_SUPABASE_SERVICE_ROLE_KEY"
  );
}

export const confirmaServer = createClient(
  confirmaUrl,
  confirmaServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);