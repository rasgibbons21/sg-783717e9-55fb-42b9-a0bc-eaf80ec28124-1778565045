CREATE TABLE IF NOT EXISTS public.ebook_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  downloaded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ebook_subscribers_email ON public.ebook_subscribers(email);

ALTER TABLE public.ebook_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_can_insert_ebook_subscriber"
  ON public.ebook_subscribers
  FOR INSERT
  WITH CHECK (true);
