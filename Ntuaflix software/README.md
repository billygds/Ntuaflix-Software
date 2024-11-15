# SoftEng

First,clone this git

Installation

-> Server:
  cd back-end
  
  npm i express
  
  npm i nodemon -D

-> Front-End:
First,rename the cloned directory "front-end" into "front-end copy".Then
make a new directory "front-end".Inside it,run these commands:

  cd front-end
  
  npx create-react-app .

  cd ntuaflix

  npm install yargs

->CLI:
cd cli-client

npx create-node-cli .

These will properly setup the environment to run react applications.Then copy 
package.json file and src/App.js file from "front-end copy" "into front-end".
Delete "front-end copy" and you are set!


Running:

Server: npm run dev

Front-End: npm start
