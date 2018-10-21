// Dependencies
const dotenv = require('dotenv')
dotenv.config()
const keys = require('./keys.js')
const inquirer = require('inquirer')
const mysql = require('mysql')
const {table, getBorderCharacters} = require('table');
const tableConfig = {
  border: getBorderCharacters('honeywell')
}
// Local MySQL db connection
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: keys.MySQL.pw,
  database: 'bamazon'
})
// Utility function, takes a MySQL database table output and a list of column headers, returns an array of arrays representing a table, formatted for the 'table' NPM package
const tablify = (aoo, ...keys) => {
  let tabled = aoo.map(obj => {
    let row = keys.map(key => obj[key])
    return row;
  })
  tabled.unshift(keys)
  return tabled
}
// Function to get sales totals sorted by department
const viewSalesByDept = () => {
  return new Promise((resolve,reject) => {
    connection.query(
      'SELECT departments.department_id AS id, products.department_name AS Department, departments.over_head_costs AS overhead, SUM(products.product_sales) AS TotalSales, SUM(products.product_sales) - departments.over_head_costs AS NetProfit FROM products INNER JOIN departments ON products.department_name = departments.department_name GROUP BY products.department_name ORDER BY id', (err, res) => {
        if (err) reject(err)
        resolve(res)
      }
    )
  })
  .then(results => {
    return tablify(results, 'id', 'Department', 'overhead', 'TotalSales', 'NetProfit')
  })
  .then(tabled => console.log(table(tabled, tableConfig)))
  .then(() => menuPrompt())
}
// Function to add a new department
const addNewDepartment = () => {
  inquirer.prompt([
    {
      name: 'deptName',
      message: 'Enter department name.',
      validate: input => {
        if (input.length < 1) return 'Please enter a name.'
        return true;
      }
    },
    {
      name: 'deptOverhead',
      message: 'Enter the department overhead costs.',
      validate: input => {
        if (isNaN(input) || input < 0) return 'Please enter a positive number.'          
        return true;
      }
    }
  ]).then(res => {
    connection.query(
      'INSERT INTO departments (department_name, over_head_costs) VALUES (?,?)', [res.deptName, res.deptOverhead]
    )
  }).then(() => menuPrompt())    
}
const quitMenu = () => {
  connection.end()
}
// main function
const menuPrompt = () => {
  inquirer.prompt([
    {
      name: 'choice',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        {
          value: viewSalesByDept,
          name: 'View Sales By Department.',
          short: 'View Sales.'
        },
        {
          value: addNewDepartment,
          name: 'Add New Department.',
          short: 'Add New Department.'
        },
        {
          value: quitMenu,
          name: 'Quit.',
          short: 'Quit.'
        }
      ]    
    }
  ]).then(x => x.choice())
    .catch(err => console.log(err))
  
}

menuPrompt();