
INSERT INTO core.users
    (first_name, last_name, username, email, mobile, password_hash)
VALUES
    ('Anuj', 'Bhaladhare', 'anuj_bhaladhare', 'anujbhaladhare@gmail.com', '9022027431', '12345678952sd54fs3d5f1s6d3s5d1fs356');



INSERT INTO core.organizations
    (name, code, description)
VALUES
    ('Indian Force Security Services', 'IFSS-GROUP-00001', 'IFSS delivers integrated security and facility management solutions that merge security personnel, technology');
    


INSERT INTO core.user_organizations
    (user_id, organization_id)
VALUES
    ('af175007-e13e-4e77-b510-270b312cd703', 'e492aba4-6e03-411b-814a-673f1c6962b0');



UPDATE rbac.roles
SET organization_id = 'e492aba4-6e03-411b-814a-673f1c6962b0'
WHERE id = '1cb6e940-13e4-410f-8cb3-8a07ae17a06d';




INSERT INTO rbac.user_roles
    (user_id, role_id, organization_id , assigned_by)
VALUES
    ('af175007-e13e-4e77-b510-270b312cd703', '1cb6e940-13e4-410f-8cb3-8a07ae17a06d', 'e492aba4-6e03-411b-814a-673f1c6962b0', 'af175007-e13e-4e77-b510-270b312cd703');
    

