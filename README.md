# Next.js Authentication Starter

This is a starter project for Next.js applications with built-in authentication using JWT (JSON Web Tokens).
It uses PostgreSQL for database and Zod for form validation.
Drizzle-orm for database queries.

## Getting Started

1. **Clone the repository**

   Use the following command to clone the repository:

   ```
   git clone https://github.com/whizM/next-auth-postgres-starter.git
   ```

2. **Install dependencies**

   Navigate to the project directory and install the necessary dependencies:

   ```
   cd next-auth-postgres-starter
   npm install
   ```

3. **Setup environment variables**

   Create a `.env.local` file in the root directory of the project and add the following variables:

   ```
   DATABASE_URL=your_postgres_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the development server**

   Start the development server with:

   ```
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- User signin / signup
  https://localhost:3000/signin
- Admin signin (admin@example.com / Admin123!)
  https://localhost:3000/admin/signin
- Role-based access control
- JWT authentication
- Form validation with Zod
- Customizable UI components

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
