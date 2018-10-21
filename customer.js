// Dependencies
const dotenv = require('dotenv')
dotenv.config()
const keys = require('./keys.js')
const inquirer = require('inquirer')
const mysql = require('mysql')
// Connect to local MySQL server
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: keys.MySQL.pw,
  database: 'bamazon'
})
// Function to pull and display the available items
const querySelection = () => {
  return new Promise((resolve, reject) => {
    console.log(`Welcome to bamazon! Here's what we've got!\n~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~\n`)
    // Query the DB for relevant info
    connection.query(
      'SELECT item_id, product_name, price, department_name FROM products', (err, res) => {
        if (err) reject(err);
        // Log each item out
        res.forEach(item => {
          console.log(`#${item.item_id}: ${item.product_name} @ $${item.price}\n`)
        })
        // Create an array of objects representing the available choices. This will be used as the choices array in the inquirer prompt that follows
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
// Function to let the customer choose a product. Takes an array of objects and returns an item object
const promptItem = (choiceArray) => {
  return inquirer.prompt([
    {
      name: 'itemID',
      message: 'Select the product to purchase.',
      type: 'list',
      choices: choiceArray // choiceArray generated dynamically from querySelection function
    }
  ])  
}
// Function to grab the inventory amount of the selected item
const queryQuantity = (idObject) => {
  let id = idObject.itemID
  return new Promise((resolve, reject) => {
    // query the DB for the stock quantity
    connection.query(
      'SELECT stock_quantity FROM products WHERE item_id = ?', [id], (err, res) => {
        if (err) reject(err)
        resolve(res[0]['stock_quantity'])
      }
    )
    // return a quantity and the item id
  }).then(res => {
    return {
      quant: res,
      id: id
    }
  })
}
// Function to ask the customer how many to purchase, takes an object with an ID and a stock quantity, returns an object with an ID and a purchase quantity
const promptQuantity = (idQuantObject) => {
  let stockQuantity = idQuantObject.quant
  let itemID = idQuantObject.id
  return inquirer.prompt([
    {
      name: 'quant',
      message: 'How many would you like to purchase?',
      validate: input => { 
        // Validation for number, greater than 0, whole
        if (isNaN(input) || input < 1 || input % 1 !== 0) return 'Please enter a positive, whole number.'
        // Validation that the desired quantity isn't greater than the available quantity
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
// Function to decrement the database stock. Takes the order object, passes same along
const placeOrder = orderObject => {
  return new Promise((resolve, reject) => {
    let id = orderObject.id
    let quant = orderObject.quant
    connection.query(
      'UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?', [quant, id], (err, res) => {
        if (err) reject(err)
        resolve(res)
      }
    )
  }).then(() => orderObject)
}
// Function to display the purchase total. Takes an order object, returns an object with an ID and a total.
const showTotal = orderObject => {
  return new Promise((resolve, reject) => {
    let id = orderObject.id
    let quant = orderObject.quant
    connection.query(
      'SELECT price FROM products WHERE item_id = ?', [id], (err, res) => {
        if (err) reject(err)
        let orderTotal = res[0]['price'] * quant        
        resolve({
          orderTotal: orderTotal,
          orderID: id
        })
      }
    )
  })
  .then(order => {
    console.log(`Order Complete! Your total was $${order.orderTotal}`)
    return order
  })
}
// Function to post the order total to the product sales column.
const postTotal = (orderObject) => {  
  return new Promise((resolve, reject) => {
    let id = orderObject.orderID
    let total = Number(orderObject.orderTotal)
    connection.query(
      'UPDATE products SET product_sales = product_sales + ? WHERE item_id = ?', [total, id], (err, res) => {
        if (err) reject(err)
        resolve(res);
      }
    )
  })
}


// Main functionality.
const shopper = () => {
  querySelection()
    .then(array => promptItem(array))
    .then(item => queryQuantity(item))
    .then(stockQuantity => promptQuantity(stockQuantity))
    .then(order => placeOrder(order))
    .then(order => showTotal(order))
    .then(order=> postTotal(order))
    .then(() => {
      connection.end()
    })
    .catch(err => console.log(err))  
}



shopper();
