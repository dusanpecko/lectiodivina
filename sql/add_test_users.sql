-- Test Users Creation Script
-- This script creates test users in the users table

INSERT INTO users (id, email, full_name, avatar_url, provider, role, created_at) VALUES
('test-user-1', 'test1@example.com', 'Test User 1', null, 'email', 'user', now()),
('test-user-2', 'test2@example.com', 'Test User 2', null, 'google', 'editor', now()),
('test-user-3', 'test3@example.com', 'Test User 3', null, 'facebook', 'moderator', now()),
('test-user-4', 'admin@example.com', 'Admin User', null, 'email', 'admin', now())
ON CONFLICT (id) DO NOTHING;

-- Check results
SELECT COUNT(*) as total_users FROM users;
SELECT role, COUNT(*) as count FROM users GROUP BY role;