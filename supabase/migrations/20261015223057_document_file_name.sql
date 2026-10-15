-- The name of the file the caregiver actually uploaded.
--
-- It was not stored, because the storage path is generated: <user_id>/<kind>-
-- <timestamp>.<ext>. That is a fine key and a useless label — nobody recognises
-- "background-check-1792096677680.pdf" as the document they chose.
--
-- The alternative was to put the original name in the path, but paths have to be
-- safe for every backend that touches them, and a filename is arbitrary text
-- with spaces and accents in it. The path stays a key; the name is data.
alter table public.caregiver_documents add column file_name text;
