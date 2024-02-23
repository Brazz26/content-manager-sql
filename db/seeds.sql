USE employees_db
INSERT INTO department
(dept_name)
VALUES 
("Medical");


INSERT INTO role
(title,salary,department_id)
VALUES
("Nurse", 80000, 1),
("Doctor", 120000, 1),
("Janitorial", 40000, 1);


INSERT INTO employee
(first_name, last_name, role_id, manager_id)
VALUES
("Wade", "Wilson", 1, NULL);