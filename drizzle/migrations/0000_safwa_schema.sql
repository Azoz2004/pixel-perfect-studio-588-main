CREATE TYPE public.app_role AS ENUM ('super_admin','supervisor','student');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "admin update profiles" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supervisor_id uuid NOT NULL,
  user_id uuid,
  full_name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  level smallint NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 5),
  prior_pages integer NOT NULL DEFAULT 0,
  overall_rating text NOT NULL DEFAULT 'جيد',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all students" ON public.students FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "supervisor own students" ON public.students FOR ALL TO authenticated USING (supervisor_id = auth.uid() AND public.has_role(auth.uid(),'supervisor')) WITH CHECK (supervisor_id = auth.uid() AND public.has_role(auth.uid(),'supervisor'));
CREATE POLICY "student self" ON public.students FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.recitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  supervisor_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'hifz' CHECK (kind IN ('hifz','review')),
  from_page integer NOT NULL,
  to_page integer NOT NULL,
  mistakes integer NOT NULL DEFAULT 0 CHECK (mistakes >= 0),
  rating text GENERATED ALWAYS AS (
    CASE WHEN mistakes <= 1 THEN 'امتياز' WHEN mistakes = 2 THEN 'ممتاز' WHEN mistakes = 3 THEN 'جيد جداً' WHEN mistakes = 4 THEN 'جيد' ELSE 'يحتاج إعادة' END
  ) STORED,
  pages integer GENERATED ALWAYS AS (GREATEST(abs(to_page - from_page) + 1, 1)) STORED,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recitations TO authenticated;
GRANT ALL ON public.recitations TO service_role;
ALTER TABLE public.recitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all rec" ON public.recitations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "supervisor own rec" ON public.recitations FOR ALL TO authenticated
  USING (supervisor_id = auth.uid() AND EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.supervisor_id = auth.uid()))
  WITH CHECK (supervisor_id = auth.uid() AND EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.supervisor_id = auth.uid()));
CREATE POLICY "student own rec" ON public.recitations FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.students s WHERE s.id = student_id AND s.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.honor_board()
RETURNS TABLE(full_name text, total_pages bigint, excellent bigint, sessions bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT s.full_name,
    COALESCE(SUM(r.pages) FILTER (WHERE r.kind='hifz'),0) AS total_pages,
    COUNT(*) FILTER (WHERE r.rating IN ('امتياز','ممتاز')) AS excellent,
    COUNT(r.id) AS sessions
  FROM public.students s JOIN public.recitations r ON r.student_id = s.id
  WHERE r.created_at > now() - interval '30 days'
  GROUP BY s.id, s.full_name
  HAVING COUNT(*) FILTER (WHERE r.rating IN ('امتياز','ممتاز')) >= 1
  ORDER BY excellent DESC, total_pages DESC
  LIMIT 10
$$;
REVOKE EXECUTE ON FUNCTION public.honor_board() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.honor_board() TO authenticated;

CREATE OR REPLACE FUNCTION public.has_any_user()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles)
$$;
GRANT EXECUTE ON FUNCTION public.has_any_user() TO anon, authenticated;