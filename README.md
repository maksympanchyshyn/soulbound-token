# Soulbound Badge & Claimer

This project includes Soulbound Badge implementation based on ERC1155. It also includes Role-based access and Claimer contract that is going to mint badges.

Install dependencies:

```shell
npm install
```

Start tests:

```shell
npx hardhat test
```

Tests coverage:

```shell
npx hardhat coverage
```

To deploy contracts run:

```shell
npx hardhat run scripts/deploy-badge.ts
npx hardhat run scripts/deploy-minter.ts
```
