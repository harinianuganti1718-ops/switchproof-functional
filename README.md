# SwitchProof functional pilot

An evidence-based gap diagnostic for professionals moving from testing, support or operations into data analytics.

## Stack

- Static landing page and Vercel serverless functions
- Gemini `gemini-2.5-flash-lite` for the structured gap report
- Supabase Postgres for requests, responses, token counts and weekly skill demand

## Setup

1. Run `supabase.sql` in a Supabase project's SQL editor.
2. Import this repository into Vercel.
3. Add `GEMINI_API_KEY`, `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` as Vercel environment variables.
4. Deploy, then submit a genuine data-analytics job description.

The browser never receives the Gemini or Supabase service key. `.gitignore` excludes all local environment files.
