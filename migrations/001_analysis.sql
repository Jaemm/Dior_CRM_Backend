-- -- Create the sequence
-- CREATE SEQUENCE products_multi_id_seq;

-- -- Create the table with the id column using the sequence
-- CREATE TABLE products_multi_connect
-- (
--     id bigint PRIMARY KEY DEFAULT nextval('products_multi_id_seq'),
--     consultant_id bigint,
--     customer_id bigint,
--     product_id bigint,
--     created_at date,
--     updated_at date,
--     CONSTRAINT unique_customer_product UNIQUE (customer_id, product_id),
--     CONSTRAINT unique_customer_product UNIQUE (consultant_id, product_id)
-- );

-- ALTER TABLE products
-- ADD COLUMN products_multi_connect BOOLEAN DEFAULT false;



-- create table customer_log  
-- (  
--     id bigint  primary key,  
--     consultant_id bigint,  
--     customer_id bigint,  
--     email varchar,  
--     app_id bigint,  
--     reason varchar not null,  
--     created_at date,  
--     updated_at date  
-- );

-- ALTER TABLE devices
-- ADD COLUMN offline_QO BOOLEAN DEFAULT true;

-- UPDATE devices
-- SET offline_QO = false
-- WHERE delivery_date < '2024-04-30';


-- RUBY TO NODE.JS
CREATE SEQUENCE product_logs_id_seq;

CREATE TABLE product_logs (
  id bigint primary key DEFAULT nextval('product_logs_id_seq'),
  product_id bigint not null,
  message varchar not null,
  consultant_id bigint,
  created_at date,
  updated_at date
)
---
CREATE SEQUENCE presign_id_seq;

CREATE TABLE presign (
  id bigint primary key DEFAULT nextval('product_logs_id_seq'),
  key varchar not null,
  url varchar not null,
  file_extension varchar not null,
  file_name varchar not null,
  created_at date,
  updated_at date
)