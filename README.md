# Games-Shop
### How to Setup the Project:
- Install nodejs from https://nodejs.org/en/download/

- Open the terminal or cmd at the project directory then run:
```
npm i
```
- Add config.env file to the project folder, then add the following:

```
PORT = <integer>
jwtSecretKey = <string>
mongoURL = <mongodb atlas connect>
digestAlgorithm = <crypto digest algorithm>
apiRequestsPerMin = <integer> 
```

#### config.env variables
###### PORT (OPTIONAL)
Port used by the server (default value 3000)
###### jwtSecretKey (REQUIRED)
A secret key that is used to sign jwt tokens this key should never be exposed (required)
###### mongoURL (REQUIRED)
1. Create a Database in mongodb atlas
2. Press on connect > connect your application > copy the connection string
3. Paste the connection string in the `mongoURL` variable then change the `<password>` to your database user password
###### digestAlgorithm (OPTIONAL)
Change the digest algorithm that is used for hashing password (default value sha256)
###### apiRequestsPerMin (OPTIONAL)
Max number of API requests a user can make per minute (default value 60)

### How to Run the Project:
- Open the terminal or cmd at the project directory then run:
```
npm run start
```
