CREATE OR REPLACE FUNCTION get_admin_applications(status_param TEXT)
RETURNS SETOF admin_applications_view
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
RETURN QUERY
SELECT * FROM admin_applications_view
WHERE status_param IS NULL OR status = status_param
ORDER BY created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_admin_applications TO authenticated;

-- Allow authenticated users to insert announcements
CREATE POLICY "Authenticated users can insert announcements" 
ON public.announcements 
FOR INSERT 
TO authenticated 
WITH CHECK (true);  -- Adjust the condition as necessary

-- Allow authenticated users to view their own announcements
CREATE POLICY "Authenticated users can view their own announcements" 
ON public.announcements 
FOR SELECT 
TO authenticated 
USING (created_by = auth.uid());

-- Allow admins to view all announcements
CREATE POLICY "Admin users can view all announcements" 
ON public.announcements 
FOR SELECT 
TO authenticated 
USING (EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data ->> 'role' = 'admin'
));


-- Allow authenticated users to delete their own announcements
CREATE POLICY "Authenticated users can delete their own announcements" 
ON public.announcements 
FOR DELETE 
TO authenticated 
USING (created_by = auth.uid());



-- Allow authenticated users to update their own announcements
CREATE POLICY "Authenticated users can update their own announcements" 
ON public.announcements 
FOR UPDATE 
TO authenticated 
USING (created_by = auth.uid());

-- Allow admins to update any announcement
CREATE POLICY "Admin users can update any announcement" 
ON public.announcements 
FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data ->> 'role' = 'admin'
));
-- Allow admins to delete any announcement
CREATE POLICY "Admin users can delete any announcement" 
ON public.announcements 
FOR DELETE 
TO authenticated 
USING (EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data ->> 'role' = 'admin'
));


-- Allow authenticated users to view all active announcements
CREATE POLICY "Authenticated users can view all active announcements"
ON public.announcements
FOR SELECT
               TO authenticated
               USING (is_active = true);

