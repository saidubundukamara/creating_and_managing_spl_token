# **Creating and Managing SPL Tokens on Solana**

This project demonstrates how to create **SPL Token using the Solana's Token 22 Program. We'll look at how to Add Metadata, Set Transfer Fees, Mint, and transfer some of the Token to another Wallet** using the Solana blockchain. It utilizes several Solana packages to facilitate the creation, management, and interaction with tokens.

## **Table of Contents**

- [**Installation**](#installation)
- [**Usage**](#usage)
- [**Dependencies**](#dependencies)
- [**License**](#license)

## **Installation**

To get started with the project, you need to have **Node.js** installed on your machine. Once you have Node.js, you can clone the repository and install the dependencies.

```bash
git clone [GitHub](https://github.com/saidubundukamara/creating_and_managing_spl_token/tree/main)

cd token_with_metadata

npm install
```

## **Usage**
To run the project, use the following command:

```bash
npm run start
```
This will execute the index.ts file using npx tsx.

## **Dependencies**
The project relies on the following dependencies:

`@solana-developers/helpers:` A set of helper functions for Solana development.

`@solana/spl-token:` A library for working with SPL tokens on the Solana blockchain.

`@solana/spl-token-metadata:` A library for managing token metadata.

`@solana/web3.js:` The Solana Web3 SDK for interacting with the Solana blockchain.

## **License**

This project is licensed under the MIT License.