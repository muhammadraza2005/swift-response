-- Create contact table
CREATE TABLE contact (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contact ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (submit contact forms)
CREATE POLICY "Anyone can submit contact forms" ON contact
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to view all contacts
CREATE POLICY "Authenticated users can view contacts" ON contact
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to update contacts
CREATE POLICY "Authenticated users can update contacts" ON contact
  FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated users to delete contacts
CREATE POLICY "Authenticated users can delete contacts" ON contact
  FOR DELETE
  TO authenticated
  USING (true);
