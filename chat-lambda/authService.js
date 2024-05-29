import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';

class AuthService {
  constructor() {
    // Initialize jwksClient
    this.client = jwksClient({
      jwksUri: process.env.COGNITO_JWKS_URI,
      timeout: 30000,
    });

    // Define getKey as an arrow function
    this.getKey = (header, callback) => {
      this.client.getSigningKey(header.kid, (err, key) => {
        if (err) {
          callback(err);
        } else {
          const signingKey = key.publicKey || key.rsaPublicKey;
          callback(null, signingKey);
        }
      });
    };

    // Define jwtOptions
    this.jwtOptions = {
      algorithms: ['RS256'],
    };
  }

  async verifyJwt(token, connection) {
    return new Promise(async (resolve, reject) => {
      jwt.verify(token, this.getKey, this.jwtOptions, async (err, decoded) => {
        if (err) {
          console.log(err);
          reject({ message: 'Unauthorized', statusCode: 401 });
        } else {
          const cognitoUserId = decoded['cognito:username'];

          try {
            const [rows] = await connection.execute(
              'SELECT * FROM user WHERE cognito_user_id = ?',
              [cognitoUserId]
            );

            if (rows.length === 0) {
              reject({ message: 'Unauthorized', statusCode: 401 });
            } else {
              const userProfile = rows[0];
              resolve(userProfile);
            }
          } catch (error) {
            console.log('error: ', error);
            reject({ message: 'Unauthorized', statusCode: 401 });
          }
        }
      });
    });
  }
}

export default AuthService;
