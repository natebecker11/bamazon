USE bamazon;

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ('Red Dead Redemption 2', 'Video Games', 59.99, 100),
('God of War 2', 'Video Games', 59.99, 50),
('The Lord Of The Rings', 'Books', 34.99, 200),
('Little Fires Everywhere', 'Books', 12.99, 350),
('SodaStream', 'Appliances', 44.99, 8),
('SodaStream Refill Cartridge', 'Appliances', 12.99, 33),
('Nokia 6.1', 'Mobile Phones', 239.99, 15),
('iPhone X', 'Mobile Phones', 999.99, 8),
('Settlers of Catan', 'Board Games', 37.99, 12),
('Gloomhaven', 'Board Games', 149.99, 6),
('7th Continent', 'Board Games', 89.99, 0);

ALTER TABLE products
ADD product_sales INT;

SELECT * FROM products;