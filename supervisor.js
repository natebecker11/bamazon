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