const dotenv = require('dotenv')
dotenv.config()
const keys = require('./keys.js')
const inquirer = require('inquirer')
const mysql = require('mysql')
const {table, getBorderCharacters} = require('table');
const tableConfig = {
  border: getBorderCharacters('honeywell')
}


const connection = mysql.createConnection({
  host: 'localhost',

  port: 3306,

  user: 'root',

  password: keys.MySQL.pw,
  database: 'bamazon'
})

const tablify = (aoo, ...keys) => {
  let tabled = aoo.map(obj => {
    let row = keys.map(key => obj[key])
    return row;
  })
  tabled.unshift(keys)
  return tabled
}


const viewSalesByDept = (dept) => {
  return new Promise((resolve,reject) => {
    connection.query(
      'SELECT departments.department_id AS id, products.department_name AS Department, departments.over_head_costs AS overhead, SUM(products.product_sales) AS TotalSales, SUM(products.product_sales) - departments.over_head_costs AS NetProfit FROM products INNER JOIN departments ON products.department_name = departments.department_name GROUP BY products.department_name ORDER BY id', (err, res) => {
        if (err) reject(err)
        // console.log(res)
        resolve(res)
      }
    )
  })
  .then(results => {
    return tablify(results, 'id', 'Department', 'overhead', 'TotalSales', 'NetProfit')
  })
  .then(tabled => console.log(table(tabled, tableConfig)))
}

const addNewDepartment = () => {
  inquirer.prompt([
    {
      name: deptName,
      message: 'Enter department name.'
    },
    {
      name: deptOverhead,
      message: 'Enter the department overhead costs.',
      validate: input => {
        if (isNaN(input) || input < 0) return 'Please enter a positive number.'          
        return true;
      }
    }
  ]).then(res => {
    connection.query(
      'INSERT INTO departments (department_name, overhead_costs) VALUES (?,?)', [res.deptName, ]
    )
  })
}