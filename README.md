# Solana Counter dApp

A simple decentralized application built on Solana blockchain that demonstrates how to interact with a smart contract from a Next.js frontend.

## Project Structure

- `contract/`: Contains the Solana smart contract built with Anchor framework
- `frontend/`: Contains the Next.js frontend application

## Smart Contract

The smart contract is a simple counter program that allows users to:
- Initialize a new counter
- Increment the counter

## Prerequisites

- Node.js (v16 or higher)
- Yarn
- Solana CLI
- Anchor Framework
- A Solana wallet (Phantom, Solflare, etc.)

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/solana-counter.git
cd solana-counter
```

### 2. Install dependencies

```bash
# Install contract dependencies
cd contract
yarn install

# Install frontend dependencies
cd ../frontend
yarn install
```

### 3. Build and deploy the smart contract

```bash
cd contract
anchor build
anchor deploy
```

Note the program ID after deployment and update it in the frontend code if necessary.

### 4. Start the frontend

```bash
cd ../frontend
yarn dev
```

The application will be available at http://localhost:3000

## Using the Application

1. Connect your Solana wallet (make sure it's set to Devnet)
2. Initialize the counter (this will create a new counter account)
3. Increment the counter
4. View transaction details on Solana Explorer

## Technologies Used

- Solana Blockchain
- Anchor Framework
- Next.js
- React
- Tailwind CSS
- @solana/web3.js
- @solana/wallet-adapter

## License

MIT
