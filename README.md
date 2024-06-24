# Demo_Credit API

This is an example project that demonstrates the usage of Express, TypeScript, and Mysql to build a server application with three models: `User`, `Wallet`, and `Transaction`. The server allows transfers between wallets, withdrawals, and funding via Paystack.

## Running App
The live version of the app can be found [here](https://demo-credit-o9ys.onrender.com/api/v1)

## Prerequisites

Make sure you have the following installed on your system:

- Node.js (v14 or above)
- npm (Node Package Manager)

## Getting Started

1. Clone the repository:

   ```shell
   git clone <repository-url>
   cd Demo_Credit

2. Install the dependencies:
   ```shell
   npm install

3. Configure environment variables:

Create a .env file in the project root and provide the necessary configuration variables. For example: as also seen in .env.example 
   ```shell
    DB_PORT=
    DB_USER=
    DB_HOST=
    DB=
    DB_PASSWORD=
    NODE_ENV=
    JWT_SECRET=
    JWT_EXPIRES_IN=
    PAYSTACK_SECRET_KEY=
    CALLBACK_URL=
    KARMA_SECRET_KEY=
   ```

4. Database Migration:
   ```shell
   npm run migrate

5. Start the server
   ```shell
   npm start

## API Routes
The server exposes the following routes:

* POST  /api/v1/user/register - Create a new user.
* POST  /api/v1/user/login - Signs user in.
* GET  /api/v1/user/me - Get my user personal user details.
* GET  /api/v1/user/bymail - Get user details by email.
* GET  /api/v1/user/byaccount - Get user details by accountNumber.
* GET  /api/v1/wallet/mywallet - Get my wallet details.
* POST /api/v1/wallet/transfer - Perform a wallet-to-wallet transfer in-app.
* POST /api/v1/wallet/fund - Fund a wallet via Paystack.
* POST /api/v1/withdraw - Withdraw from wallet to bank account.
* GET /api/v1/wallet/verifyfunds - Verify payment initiated by Paystack and update wallet balance.
* GET /api/v1/transactions/transactions - Get all my transactions.
