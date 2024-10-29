# Installation

1. Clone the Repository: Begin by cloning this repository to your local machine.
2. Check Node.js Version: Ensure you have Node.js version 20 installed. You can verify this by running `node -v` in your terminal.
3. Install Redis: Make sure you have Redis version 6.2.0 or higher installed. You can check the Redis version with `redis-server --version`.
4. Set Up PostgreSQL: Confirm that you have the latest version of PostgreSQL database installed on your system.
5. Navigate to the Cloned Repository Directory: Open your terminal and change to the directory where you cloned the repository.
6. Install all dependencies with the command: `yarn` if you do not have it install it by `npm install --global yarn`
7. Create Environment Variables: Copy the variables from the .env.example file to create a new .env file. Make sure to enter your own configuration values in this new file.
8. Generate Database Schema: Use the following command to generate the database schema:`yarn migration:generate src/_migrations/migration_name` Replace migration_name with a suitable name for your migration.
9. Run Migrations: Apply the generated migrations to the database by executing `yarn migration:run`
10. Start the Application: After completing all previous steps, start the application with `yarn start:dev`
11. Access Swagger UI: Once the server is running, open your web browser and go to `http://localhost:your_port/swagger` Replace your_port with the actual port number your application is running on to access the Swagger documentation.
12. to run test run the command in terminal `yarn test:e2e`

## Features

1. Redis is used in this application to store and manage mail queues, enabling efficient and reliable email processing.

## Default Data

1. admin email : `kukushi@gmail.com`
2. admin password : `akashi`
