# gb-local-node-server
Local node server on each GB for connecting to API

## Setup

### Environment

NodeJS via NVM
- [Install Instructions](https://github.com/nvm-sh/nvm#install--update-script)
- Setup
  - `nvm install node`
  - `nvm alias node`
- Clone and cd into repo
- Install npm packages `npm i`

Setup the user account for the gb

### Environment Variables

`process.env.SERVER_ADDRESS` - default "http://localhost:3001"
`process.env.SOCKET_ADDRESS` - default "http://localhost:8000"

On ROS Melodic, tornador must be downgraded for this package to work.
`sudo pip install tornado==4.5.3`

## Run
Development - `npm run dev`

Production - `npm run start`

