# Auxiliary and optional back end for the Convergent Personal Economy platform

## Overview

This is a backend server built with node.js and express, that saves blockchain and IPFS data to a mongoDB database to enable faster display in the Convergent frontend application.

## Architecture

When the server starts, it collects all existing personal tokens (that were created through the Convergent factory contract) and saves the corresponding data to a mongoDB database. The server then continues to listen to the relevant contracts and saves new economies as they are created or updated. It exposes 2 REST APIs for the frontend: 

### getEconomies
To get all saved economies and their associated IPFS data, send a GET request to `localhost:3000/economies`.

### getEconomy
To fetch a single economy and its associated IPFS data, send a GET request to `localhost:3000/economies/:tokenAddress`

### (For testing:) postEconomy
To test creating a new economy, you can send a POST request to `localhost:3000/post`. This will soon be deprecated, since only the token factory contract can create new economies.


## Install

```
$ npm install
```

## Run

```
$ npm start
```
