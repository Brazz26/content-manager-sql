const inquirer = require('inquirer')
const mysql = require('mysql2')
const logo = require('asciiart-logo')
require('console.table')


const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        database: 'employees_db'
    },
    console.log('connected')
)




function startTracker() {
    const title = logo({ name: 'Med-Squad' }).render()
    console.log(title)
    inquirer.prompt([
        {
            type: 'list',
            name: 'main',
            message: 'What would you like to do?',
            choices: [
                'View all employees',
                'View all departments',
                'View all roles',
                'Add department',
                'Add role',
                'Add employee',
                'Update employee role',
                'Update employee manager',
                'Exit'
            ]
        }
    ]).then((answers) => {
        console.log('user selected' + answers.main)
        let choices = answers.main
        switch (choices) {
            case 'View all employees':
                viewAllEmployees()
                break
            case 'View all departments':
                viewAllDepartments()
                break
            case 'View all roles':
                viewAllRoles()
                break
            case 'Add department':
                addDepartment()
                break
            case 'Add role':
                addRole()
                break
            case 'Add employee':
                addEmployee()
                break
            case 'Update employee role':
                updateEmployeeRole()
                break
            case 'Update employee manager':
                updateEmployeeManager()
            case 'Exit':
                exit()
        }
    })
}
function viewAllDepartments() {
    db.query('SELECT id AS department_id, dept_name AS department_name FROM department',
        function (err, res) {
            err ? console.log(err) : console.table(res), startTracker()
        });
}
function viewAllRoles() {
    db.query('SELECT r.id AS role_id, r.title AS job_title, r.salary, d.dept_name AS dept_name FROM role r JOIN department d ON r.department_id = d.id',
        function (err, res) {
            err ? console.log(err) : console.table(res), startTracker()
        });

} function viewAllEmployees() {
    db.query(' SELECT e.id AS employee_id, e.first_name, e.last_name, r.title AS job_title, d.dept_name AS department, r.salary, CONCAT(m.first_name, " ", m.last_name) AS manager_name FROM employee e JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id;',
        function (err, res) {
            err ? console.log(err) : console.table(res), startTracker()
        });
} function addDepartment() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'department',
            message: 'What department would you like to add?'
        }
    ]).then((departmentResponse) => {
        let departmentName = departmentResponse.department
        db.query('INSERT INTO department (dept_name) VALUES (?)',
            [departmentName], function (err, res) {
                err ? console.log(err) : viewAllDepartments()
            })
    })

} function addRole() {
    db.query('SELECT * FROM department', function (err, res) {
        if (err) {
            console.log(err),
                startTracker()
        }
        const deptList = res.map((department) => ({
            value: department.id,
            name: department.dept_name
        }));
        inquirer.prompt([
            {
                type: 'input',
                name: 'role',
                messsage: 'Enter new role',
            },
            {
                type: 'input',
                name: 'Salary',
                message: 'What is the salary amount?'
            },
            {
                type: 'list',
                name: 'departmentName',
                message: 'What department would you like to add the role into?',
                choices: deptList
            }
        ]).then((roleResponse) => {
            let departmentName = roleResponse.departmentName
            let role = roleResponse.role
            let salary = roleResponse.Salary
            db.query('INSERT INTO role (title, salary, department_id) VALUE (?,?,?)',
                [role, salary, departmentName], function (err, res) {
                    if (err) {
                        console.log(err),
                            startTracker();
                    }
                    viewAllRoles();
                })
        })
    })
} function addEmployee() {
    db.query('SELECT * FROM role', function (err, res) {
        if (err) {
            console.log(err),
                startTracker()
        }
        let roleId = res.map((role) => ({
            value: role.id,
            name: role.title
        }))

        db.query('SELECT * FROM employee', function (err, res) {
            if (err) {
                console.log(err),
                    startTracker()
            }
            const managers = res.map((manager) => ({
                value: manager.id,
                name: `${manager.first_name} ${manager.last_name}`
            }))
            managers.push({ value: null, name: 'no manager' })
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: 'Enter firstName'
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'Enter lastNme'
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'Enter role for employee',
                    choices: roleId,
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: 'Does employee have manager?',
                    choices: managers
                }
            ]).then((employeeResponse) => {
                const roleName = employeeResponse.role
                const employeeName = employeeResponse.firstName
                const employeeLast = employeeResponse.lastName
                const managerId = employeeResponse.manager

                db.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)', [employeeName, employeeLast, roleName, managerId], function (err, res) {
                    err ? console.log(err) : viewAllEmployees();
                })
            })
        })
    })
}
function updateEmployeeRole() {
    db.query('SELECT * FROM employee', function (err, res) {
        // if (err) {
        //     console.log(err),
        //         startTracker()
        console.log(res)

        const employees = res.map((employee) => ({
            value: employee.id,
            name: `${employee.first_name} ${employee.last_name}`
        }))
        inquirer.prompt(
            {
                type: 'list',
                name: 'employeeSelected',
                message: 'Which employee would you like to update with a new role?',
                choices: employees
            }
        ).then(data => {
            let employee_id = data.employeeSelected
            console.log(employee_id)
            db.query('SELECT * FROM role', function (err, res) {
                // if (err) {
                //     console.log(err),
                //         startTracker()
                console.log(res)

                const roles = res.map((role) => ({
                    value: role.id,
                    name: role.title
                }))
                console.log(roles)
                inquirer.prompt({
                    type: 'list',
                    name: 'roleSelected',
                    message: 'What role would you like employee to have?',
                    choices: roles
                }).then(
                    data => {
                        let role_id = data.roleSelected
                        console.log(role_id)
                        db.query('UPDATE employee SET role_id = ? WHERE id = ?', [role_id, employee_id], function (err, res) {
                            if (err) {
                                console.log(err)
                                // startTracker()
                            }
                            console.log("updated role")
                        })
                    })
            })
        })
    })

}
function updateEmployeeManager() {
    db.query('SELECT * FROM employee', function (err, res) {
        // if (err) {
        //     console.log(err),
        //         startTracker()
        console.log(results)

        const employees = res.map((employee) => ({
            value: employee.id,
            name: `${employee.first_name} ${employee.last_name}`
        }))
        inquirer.prompt(
            {
                type: 'list',
                name: 'employeeSelected',
                message: "Which employee's manager would you like to update?",
                choices: employees
            }
        ).then(data => {
            let employee_id = data.employeeSelected
            console.log(employee_id)
            db.query('SELECT * FROM manager', function (err, res) {
                // if (err) {
                //     console.log(err),
                //         startTracker()
                console.log(res)

                const managers = res.map((manager) => ({
                    value: manager.id,
                    name: manager.title
                }))
                console.log(managers)
                inquirer.prompt({
                    type: 'list',
                    name: 'managerSelected',
                    message: 'What manager would you like employee to have?',
                    choices: managers
                }).then(

                )
            })
        })
    })
}


function exit() {
    process.exit();
}


startTracker()