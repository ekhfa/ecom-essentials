CREATE DATABASE ecommerce_database;

CREATE TABLE product(
    product_id SERIAL PRIMARY KEY, 
    title VARCHAR(255),
    description VARCHAR(255),
    categories VARCHAR(255),
    quantity DECIMAL(10, 2), 
    price DECIMAL(10, 2)
);

ALTER TABLE product
RENAME COLUMN product_id TO id;

ALTER TABLE product
ADD image VARCHAR(255);
