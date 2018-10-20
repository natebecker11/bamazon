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
        if (isNaN(input) || input < 1 || input % 1 !== 0) return 'Please enter a positive, whole number.'
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

const postTotal = (orderObject) => {
  
  return new Promise((resolve, reject) => {
    let id = orderObject.orderID
    let total = orderObject.orderTotal
    // console.log(id, total)
    connection.query(
      'UPDATE products SET product_sales = product_sales + ? WHERE item_id = ?', [total, id], (err, res) => {
        if (err) reject(err)
        console.log(res);
        resolve(res);
      }
    )
  })
}



const shopper = () => {
  querySelection()
    .then(array => promptItem(array))
    .then(item => queryQuantity(item))
    .then(stockQuantity => promptQuantity(stockQuantity))
    .then(order => placeOrder(order))
    .then(order => showTotal(order))
    .then(() => {
      connection.end()
    })
    .catch(err => console.log(err))  
}



// shopper();
postTotal({
  orderTotal: 0,
  orderID: 3
});

