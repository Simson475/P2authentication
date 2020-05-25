# P2authentication
 
 ## Project Layout
 The repository is split into four main folders being *PWMAN*, *src*, *Server*, and *Tests*.
 - [PWMAN](PWMAN) - HTML-, CSS- and bundled Js-files needed to add the extension to your browser. This is the final password manager after bundling the files from src..
 - [SRC](src) - Source code that is being bundled into the code used in PWMAN 
 - [Server](Server) - Code used for running the MySQL database and Node server 
 - [Tests](tests) - Code used for running the Jest tests

 ## Dependencies
  - [Bcrypt](https://www.npmjs.com/package/bcrypt)
  - [Crypto-random-string](https://www.npmjs.com/package/crypto-random-string) 
  - [Dotenv](https://www.npmjs.com/package/dotenv)
  - [Express](https://www.npmjs.com/package/express)
  - [Jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) 
  - [Mysql](https://www.npmjs.com/package/mysql)
  - [webpack](https://www.npmjs.com/package/webpack)
  - [Jest](https://www.npmjs.com/package/jest) 
  - [Jsdoc](https://www.npmjs.com/package/jsdoc) 
  - [Puppeteer](https://www.npmjs.com/package/puppeteer)

 ## Necessarry Installments
  To be able to run this program there are 2 neccessarry instalments that are needed 
   - [Node.js](https://nodejs.org/) Needed to run the server. 
   - [NPM](https://www.npmjs.com/) Needed to install all dependencies.
   - [Chrome](https://www.google.com/chrome/) - Or any other chromium based browser. 
 ## Program Description 
 This program is a proof of concept, showing the pepper and client-side hashing can be used in a password manager.
 ## Installation
 When the repository has been cloned, use the package manager [NPM](https://www.npmjs.com/get-npm) to install the dependencies.
 ```bash
 npm install 
 ```
 When this is done build the newest version from the source files
 ```bash
 npm run build 
 ```
 The password manger is now stored in the newest version in the subfolder PWMAN.
 Import this to chrome as a chrome extension, this is done by enabling developer mode and loading the folder using *Load Unpacked*
 The password manager is now ready for use and should be visisble in the top right hand corner of the extensions tabs.
 The extension can be opened by clicking the PWMan icon.(Make sure the server is up and running. if it isnt, please contact us.)



