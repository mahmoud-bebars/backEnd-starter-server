CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  userId VARCHAR(50),
  firstName VARCHAR(30),
  LastName VARCHAR(30),
  username VARCHAR(50),
  phone VARCHAR(30),
  email VARCHAR(100),
  emailVerfiy BOOLEAN,
  password text
);