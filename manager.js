// dependencies
const dotenv = require('dotenv')
dotenv.config()
const keys = require('./keys.js')
const inquirer = require('inquirer')
const mysql = require('mysql')
const {table, getBorderCharacters} = require('table');
const tableConfig = {
  border: getBorderCharacters('honeywell')
}
// local mysql database connection
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
// Function to display available products in a table
const viewProducts = () => {
  return new Promise((resolve, reject) => {
    connection.query(
      'SELECT * FROM products', (err, res) => {
        if (err) reject(err)
        resolve(res)
      }
    )
  })
  .then(res => tablify(res, 'item_id', 'product_name', 'department_name', 'price', 'stock_quantity'))
  .then(tabled => console.log(table(tabled, tableConfig)))
  .then(_ => {
    console.log('Returning to main menu...')
    menuPrompt()
  })
}
// Function to display items with low inventory
const viewLowInv = () => {
  return new Promise((resolve, reject) => { 
    connection.query(
      'SELECT item_id, product_name, stock_quantity FROM products WHERE stock_quantity < 5', (err, res) => {
        if (err) reject(err)
        resolve(res)
      }
    )
  })
  .then(res => tablify(res, 'item_id', 'product_name', 'stock_quantity'))
  .then(tabled => console.log(table(tabled, tableConfig)))
  .then(_ => {
    console.log('Returning to main menu...')
    menuPrompt()
  })
}
// Function to add to inventory
const addInv = () => {
  return new Promise((resolve, reject) => {
    connection.query(
      'SELECT item_id, product_name FROM products', (err, res) => {
        if (err) reject(err)
        // create array of choices for the prompt below
        let choiceArray = res.map(item => {
          return {
            name: item.product_name,
            short: item.product_name,
            value: item.item_id
          }
        })
        resolve(choiceArray)
      }
    )
  })
  .then(choiceArray => {
    return inquirer.prompt([
      {
        name: 'product',
        message: 'Which product would you like to add to?',
        type: 'list',
        choices: choiceArray
      },
      {
        name: 'quantity',
        message: 'How many would you like to add?',
        validate: input => {
          if (isNaN(input) || input < 1 || input % 1 !== 0) return 'Please enter a positive, whole number.'          
          return true;
        }
      }
    ])
  })
  .then(resp => {
    let quantity = parseInt(resp.quantity)
    let id = parseInt(resp.product)
    connection.query(
      'UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?', [quantity, id], (err) => {
        if (err) throw err       
        
      }
    )
  })
  .then(_=> {
    console.log('Added Stock.')
    console.log('Returning to main menu...')
    menuPrompt()
  })
}
// function to add a new product
const addNewProd = () => {
  inquirer.prompt([
    {
      name: 'product_name',
      message: 'Enter the product name.'
    },
    {
      name: 'department_name',
      message: 'Choose a department',
      type: 'list',
      choices: ['Video Games', 'Books', 'Appliances', 'Mobile Phones', 'Board Games']
    },
    {
      name: 'price',
      message: 'Enter the price.',
      validate: input => {
        if (isNaN(input) || input < 0) return 'Please enter a positive number.'          
        return true;
      }
    },
    {
      name: 'stock_quantity',
      message: 'Enter the initial stock quantity.',
      validate: input => {
        if (isNaN(input) || input < 0 || input % 1 !== 0) return 'Please enter a positive, whole number.'          
        return true;
      }
    },
  ])
  .then(item => {
    let pN = item.product_name
    let pD = item.department_name
    let pP = Number(item.price)
    let pS = Number(item.stock_quantity)
    return connection.query(
      'INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?)', [pN, pD, pP, pS], (err, res) => {
        if (err) throw err        
      }
    )
  })
  .then(_ => {
    console.log('Added new stock.')
    console.log('Returning to main menu...')
    menuPrompt();
  })
}

const quitMenu = () => {
  connection.end()
}
// main functionality, calls a each list choice supplies a function name which is called in the then() that follows
const menuPrompt = () => {
  inquirer.prompt([
    {
      name: 'choice',
      type: 'list',
      message: 'What would you like to do?',
      choices: [
        {
          value: viewProducts,
          name: 'View Products For Sale.',
          short: 'View Products.'
        },
        {
          value: viewLowInv,
          name: 'View Low Inventory.',
          short: 'View Low Inventory.'
        },
        {
          value: addInv,
          name: 'Add To Inventory.',
          short: 'Add To Inventory.'
        },
        {
          value: addNewProd,
          name: 'Add New Product',
          short: 'Add New Product'
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

menuPrompt()