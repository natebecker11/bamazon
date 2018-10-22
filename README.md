# bamazon
A CLI app for tracking and managing inventory using node.js and MySQL

## Overview
This app simulates how users with a variety of roles might interface with an inventory system. 

* **Customers** can view available inventory and make a purchase. 
* **Managers** can view and audit inventory levels, replenish stock, and add new SKUs. 
* **Supervisors** can get an overview of sales for each department, and add new departments.

All three are accessed through the command line, and results are given in the command line.

## Setting up the app
### 1. Clone or download this repository

![Clone or Download Image](https://i.imgur.com/AxFTb5x.png)

### 2. Install node if you dont have it

Instructions found at [npmjs.com](https://docs.npmjs.com/getting-started/installing-node)

### 3. Install required dependencies

In terminal (Mac) or bash (PC), navigate to the folder where you have this app. Then install dependencies:  
  `npm i`  
The following dependencies will be installed:

* [dotenv](https://www.npmjs.com/package/dotenv)
* [inquirer](https://www.npmjs.com/package/inquirer)
* [mysql](https://www.npmjs.com/package/mysql)
* [table](https://www.npmjs.com/package/table)

### 4. Download and install MySQL Server and MySQL Workbench
Navigate to the [MySQL Downloads](https://dev.mysql.com/downloads/mysql/) page. Download the appropriate installer for your operating system, then run the installer. Then, it will walk you through configuring MySQL server. During this process, you will be prompted to enter a password for your server. Copy whatever you choose, you will need it in the next steps.

### 5. Create a .env file
Create a new file, called '.env' in the directory where the app is installed. Paste the following text in, substituting your own MySQL password.

```
#MySQL credentials
MYSQL_PASSWORD=YOUR_PASSWORD_HERE
```
This file is used by the app to interact with MySQL.

### 6. Set up your server
Open MySQL workbench, and run the following files, in this order:
* bamazonSeed.sql
* bamazonSeed2.sql
* departmentSeed.sql
* departmentSeed2.sql

## Using the app
There are three different menu systems in this app, one each for Customers, Managers, and Supervisors. For a video demostration, click [here](https://drive.google.com/file/d/1QuWyAL8l86Q2FYdtVdp-PrImudj_vOPp/view)

### Customers

From the command line, navigate to the directory where the app is installed. To use the app, enter the following:

```
node customer.js
```

From there, follow the prompts to place an order.

### Managers

From the command line, navigate to the directory where the app is installed. To use the app, enter the following:

```
node manager.js
```

From there, you have several choices:
* View inventory
* View low-inventory items
* Replenish inventory of an existing item
* Add a new item listing

### Supervisors

From the command line, navigate to the directory where the app is installed. To use the app, enter the following:

```
node supervisor.js
```

From there, you have two choices:
* View sales totals by department
* Add a new department

## Future development

- [x] Dynamically pull new department listings into Manager mode for adding new items
- [ ] Use Express to add real remote database functionality

