-- Read-only examples for Demo-Enquiries.sqlite (fictional local data).
SELECT id, name, email, intent, material, status, revision, created_at, updated_at
FROM enquiries
ORDER BY created_at DESC;

SELECT id, message, status
FROM enquiries
WHERE id = '245facbc-c147-4155-bc05-691cec49c1a1';

SELECT status, COUNT(*) AS enquiry_count
FROM enquiries
GROUP BY status;

-- This local snapshot is separate from hosted D1. The hosted browser example
-- has reference 55c746d5-c2af-4352-9a63-0180ccca801c and can be viewed at /admin.
