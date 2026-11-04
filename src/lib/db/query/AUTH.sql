
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
    ('db5c8931-d63f-4cad-9987-620ae86ba3ad', '29478c66-9833-47f8-be4b-75642c5991d8');



UPDATE rbac.roles
SET organization_id = '29478c66-9833-47f8-be4b-75642c5991d8'
WHERE id = 'b10a232c-90ec-44f2-8c8d-88c0c52c6ed5';




INSERT INTO rbac.user_roles
    (user_id, role_id, organization_id , assigned_by)
VALUES
    ('db5c8931-d63f-4cad-9987-620ae86ba3ad', 'b10a232c-90ec-44f2-8c8d-88c0c52c6ed5', '29478c66-9833-47f8-be4b-75642c5991d8', 'db5c8931-d63f-4cad-9987-620ae86ba3ad');
    

