-- Connect to the dealership database
\c dealership;

-- Step 1: Insert users into the app_user table
INSERT INTO app_user (username, password, first_name, last_name, user_type) VALUES
('owner', 'owner', 'O', 'Owner', 'owner'),
('user01', 'pass01', 'Mitzie', 'Wenner', 'manager'),
('user02', 'pass02', 'Paris', 'Dubaldi', 'inventory_clerk'),
('user03', 'pass03', 'Roslyn', 'Colaizzo', 'sales_person'),
('user04', 'pass04', 'Chantell', 'Haroldson', 'sales_person'),
('user05', 'pass05', 'Gearldine', 'Paa', 'inventory_clerk'),
('user06', 'pass06', 'Delisa', 'Demesa', 'sales_person'),
('user07', 'pass07', 'Caitlin', 'Poquette', 'inventory_clerk'),
('user08', 'pass08', 'Kristofer', 'Leto', 'manager'),
('user09', 'pass09', 'Leonida', 'Gesick', 'inventory_clerk'),
('user10', 'pass10', 'Colette', 'Berganza', 'inventory_clerk'),
('user11', 'pass11', 'Fletcher', 'Luczki', 'inventory_clerk'),
('user12', 'pass12', 'Bulah', 'Jillson', 'inventory_clerk'),
('user13', 'pass13', 'Glory', 'Nayar', 'inventory_clerk'),
('user14', 'pass14', 'Fatima', 'Hughey', 'manager'),
('user15', 'pass15', 'Yoko', 'Ferrario', 'inventory_clerk'),
('user16', 'pass16', 'Britt', 'Threets', 'sales_person'),
('user17', 'pass17', 'Donte', 'Plumer', 'inventory_clerk'),
('user18', 'pass18', 'Cristal', 'Dopico', 'inventory_clerk'),
('user19', 'pass19', 'Carey', 'Ketelsen', 'sales_person'),
('user20', 'pass20', 'Angella', 'Agramonte', 'inventory_clerk'),
('user21', 'pass21', 'Buddy', 'Karpin', 'inventory_clerk'),
('user22', 'pass22', 'Fletcher', 'Sawchuk', 'manager'),
('user23', 'pass23', 'Yoko', 'Leinenbach', 'sales_person'),
('user24', 'pass24', 'Taryn', 'Whobrey', 'inventory_clerk'),
('user25', 'pass25', 'Mari', 'Mcrae', 'sales_person');

-- Step 2: Insert records into inventory_clerk, manager, and salesperson tables based on user_type

-- Insert inventory clerks
INSERT INTO inventory_clerk (username)
SELECT username
FROM app_user
WHERE user_type = 'inventory_clerk' OR user_type = 'owner';

-- Insert managers
INSERT INTO manager (username)
SELECT username
FROM app_user
WHERE user_type = 'manager' OR user_type = 'owner';

-- Insert salespersons
INSERT INTO salesperson (username)
SELECT username
FROM app_user
WHERE user_type = 'sales_person' OR user_type = 'owner';
