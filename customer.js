const dotenv = require('dotenv')
dotenv.config()
const keys = require('./keys.js')
const inquirer = require('inquirer')
const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'localhost',

  port: 3306,

  user: 'root',

  password: keys.MySQL.pw,
  database: 'bamazon'
})


const querySelection = () => {
  return new Promise((resolve, reject) => {
    console.log(`Welcome to bamazon! Here's what we've got!\n~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~\n`)
    connection.query(
      'SELECT item_id, product_name, price, department_name FROM products', (err, res) => {
        if (err) reject(err);
        res.forEach(item => {
          console.log(`#${item.item_id}: ${item.product_name} @ $${item.price}\n`)
        })
        let choiceArray = res.map(item => {
          return {
            name: `${item.product_name} in ${item.department_name}`,
            value: `${item.item_id}`,
            short: item.product_name
          }
        })
        resolve(choiceArray);
      }
    )
  })
}

const promptItem = (choiceArray) => {
  return inquirer.prompt([
    {
      name: 'itemID',
      message: 'Select the product to purchase.',
      type: 'list',
      choices: choiceArray
    }
  ])  
}

const queryQuantity = (idObject) => {
  let id = idObject.itemID

  return new Promise((resolve, reject) => {
    connection.query(
      'SELECT stock_quantity FROM products WHERE item_id = ?', [id], (err, res) => {
        if (err) reject(err)
        resolve(res[0]['stock_quantity'])
      }
    )
  }).then(res => {
    return {
      quant: res,
      id: id
    }
  })
}

const promptQuantity = (idQuantObject) => {
  let stockQuantity = idQuantObject.quant
  let itemID = idQuantObject.id
  return inquirer.prompt([
    {
      name: 'quant',
      message: 'How many would you like to purchase?',
      validate: input => {
        if (isNaN(input)) return 'Please enter a number.'
        if (input > stockQuantity) return `I'm sorry, we only have ${stockQuantity} in stock.`
        return true;
      }      
    }
  ]).then(number => {
    return {
      quant: number.quant,
      id: itemID
    }
  })
}

const shopper = () => {
  querySelection()
    .then(array => promptItem(array))
    .then(item => queryQuantity(item))
    .then(stockQuantity => promptQuantity(stockQuantity))
    .then(result => console.log(result))
    .catch(err => console.log(err))  
}



shopper();

// queryQuantity({itemID:1}).then(x=>console.log(x))
// promptQuantity({ quant: 100, id: 1 }).then(x=>console.log(x))