# FIDO Security

```bash
Node version >= 18.17.1
```

## Environment Variables:

Add these keys as an environment variable

`DB_HOST`: Database host

`DB_USERNAME`: Database User

`DB_PASSWORD`: Database Password

`DB_NAME`: Database name

`DB_PORT`: Database port

## Getting started:

#### Install Dependencies
To install the project dependencies, run the following command in your project's root directory:

```
npm install
```

### SAM

To invoke the function in local
```
sam local invoke <functionID> --no-event
sam local invoke <functionID> --event <pathToEventFile.json>
sam local start-api
```

### Migration

#### Create a migration
* npx typeorm-ts-node-commonjs migration:generate src/migrations/{migrationName} -d src/orm-config.ts

#### Run the migration
* npx typeorm-ts-node-commonjs migration:run -d src/orm-config.ts


### Deployment
yarn build-ts
### Run
yarn start

### Test
#### Unit tests
yarn test