CREATE TABLE public.certificates_issued (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  level TEXT NOT NULL,
  certificate_id TEXT NOT NULL UNIQUE,
  issued_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_certificates_user ON certificates_issued(user_id);
CREATE INDEX idx_certificates_id ON certificates_issued(certificate_id);

ALTER TABLE public.certificates_issued ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_certificates" ON public.certificates_issued
  FOR SELECT USING (user_id = auth.uid());
