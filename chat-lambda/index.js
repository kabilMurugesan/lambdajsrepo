import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import AuthService from './authService.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const connectDatabase = async () => {
  try {
    return await mysql.createConnection({
      host: process.env.RDS_HOSTNAME,
      user: process.env.RDS_USERNAME,
      password: process.env.RDS_PASSWORD,
      database: process.env.RDS_DATABASE,
    });
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
    throw error;
  }
};

const executeQuery = async (connection, query, params) => {
  try {
    return await connection.execute(query, params);
  } catch (error) {
    console.error(`Error executing query: ${query}`, error.message);
    throw error;
  }
};

const handleResponse = (statusCode, message, headers) => {
  return {
    headers: headers,
    statusCode,
    body: JSON.stringify(message),
  };
};

const upsertSocketConnection = async (connection, data) => {
  const {
    connectionId,
    chatId,
    userId,
    sourceIpAddress,
    createdOn,
    updatedOn,
    id,
  } = data;
  const checkExistenceQuery =
    'SELECT 1 FROM socket_connections WHERE chat_id = ? AND user_id = ?;';
  const [existenceRows] = await connection.execute(checkExistenceQuery, [
    chatId,
    userId,
  ]);

  if (existenceRows.length > 0) {
    const deleteQuery =
      'DELETE FROM socket_connections WHERE chat_id = ? AND user_id = ?;';
    await executeQuery(connection, deleteQuery, [chatId, userId]);
  }

  const insertQuery = `
    INSERT INTO socket_connections (
      connection_id, chat_id, user_id, source_ip_address, created_on, updated_on, created_by, updated_by, id
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  await connection.execute(insertQuery, [
    connectionId,
    chatId,
    userId,
    sourceIpAddress,
    createdOn,
    updatedOn,
    userId,
    userId,
    id,
  ]);
};

const removeConnectionId = async (connection, connectionId) => {
  const deleteQuery = 'DELETE FROM socket_connections WHERE connection_id = ?;';
  await executeQuery(connection, deleteQuery, [connectionId]);
};

const findConnectionIds = async (connection, chatId) => {
  const selectQuery =
    'SELECT connection_id FROM socket_connections WHERE chat_id = ?;';
  const [rows] = await executeQuery(connection, selectQuery, [chatId]);
  return rows.map((row) => row.connection_id);
};

const postMessage = async (
  connectionId,
  message,
  client,
  userId,
  messageCreatedTime,
  connection
) => {
  const selectQuery =
    'SELECT CONCAT(first_name, " ", last_name) AS name, profile_photo_file_name AS profileImage FROM user_profile WHERE user_id = ?;';
  const [rows] = await executeQuery(connection, selectQuery, [userId]);
  const { name, profileImage } = rows[0];

  const command = new PostToConnectionCommand({
    ConnectionId: connectionId,
    Data: Buffer.from(
      JSON.stringify({
        userId,
        name,
        message,
        profileImage,
        messageCreatedTime,
      })
    ),
  });

  try {
    await client.send(command);
  } catch (error) {
    await removeConnectionId(connection, connectionId);
    console.log(`Error posting to connection ${connectionId}`, error.message);
  }
};

const handleConnect = async (
  connection,
  { connectionId, chatId, userId, sourceIpAddress }
) => {
  const userConnectedTime = new Date();
  const createdOn = userConnectedTime;
  const updatedOn = userConnectedTime;
  const id = uuidv4();
  await upsertSocketConnection(connection, {
    connectionId,
    chatId,
    userId,
    sourceIpAddress,
    createdOn,
    updatedOn,
    id,
  });
};

const handleDisconnect = async (connection, connectionId) => {
  await removeConnectionId(connection, connectionId);
};

const handlePostMessage = async (
  connection,
  { chatId, message, userId, callbackUrl, connectionId }
) => {
  const messageCreatedTime = new Date();
  const chatMessageId = uuidv4();

  await executeQuery(
    connection,
    `
      INSERT INTO chat_messages (id, chat_id, message, created_on, updated_on, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `,
    [
      chatMessageId,
      chatId,
      message,
      messageCreatedTime,
      messageCreatedTime,
      userId,
      userId,
    ]
  );

  await executeQuery(
    connection,
    `
      INSERT INTO chat_message_recipients (id, chat_message_id, user_id, created_on, updated_on, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?);
    `,
    [
      uuidv4(),
      chatMessageId,
      userId,
      messageCreatedTime,
      messageCreatedTime,
      userId,
      userId,
    ]
  );

  const activeConnectionIds = await findConnectionIds(connection, chatId);

  try {
    const client = new ApiGatewayManagementApiClient({
      endpoint: callbackUrl,
    });

    const postAll = activeConnectionIds
      .filter((id) => id !== connectionId)
      .map((id) =>
        postMessage(id, message, client, userId, messageCreatedTime, connection)
      );

    await Promise.all(postAll);
  } catch (err) {
    console.log('Error posting to all connections', err.message);
  }
};

export const handler = async (event) => {
  console.log(JSON.stringify(event));
  let connection;
  let headers;

  try {
    connection = await connectDatabase();
    const {
      requestContext: { domainName, stage, connectionId, identity, eventType },
      queryStringParameters: { chatId } = {},
      body,
    } = event;

    const { sourceIp: sourceIpAddress } = identity;
    const callbackUrl = `https://${domainName}/${stage}`;

    switch (eventType) {
      case 'CONNECT':
        let userId;
        try {
          if (event.headers['Sec-WebSocket-Protocol'] === undefined) {
            return handleResponse(401, 'Unauthorized', CORS_HEADERS);
          }
          const subprotocolHeader = event.headers['Sec-WebSocket-Protocol'];
          const subprotocols = subprotocolHeader.split(',');
          const authService = new AuthService();
          var token = subprotocols[1].trim();
          const user = await authService.verifyJwt(token, connection);
          userId = user.id;
          await handleConnect(connection, {
            connectionId,
            chatId,
            userId,
            sourceIpAddress,
          });
          headers = {
            'Sec-WebSocket-Protocol': subprotocols[0],
            ...CORS_HEADERS,
          };
        } catch (error) {
          console.error('Error during $connect:', error.message);
          return handleResponse(401, 'Unauthorized', CORS_HEADERS);
        }
        break;

      case 'DISCONNECT':
        await handleDisconnect(connection, connectionId);
        headers = CORS_HEADERS;
        break;

      case 'MESSAGE':
        const parsedBody = JSON.parse(body);
        if (
          parsedBody.chatId !== undefined &&
          parsedBody.message !== undefined &&
          parsedBody.userId !== undefined
        ) {
          await handlePostMessage(connection, {
            chatId: parsedBody.chatId,
            message: parsedBody.message,
            userId: parsedBody.userId,
            callbackUrl,
            connectionId,
          });
          headers = CORS_HEADERS;
        } else {
          return handleResponse(401, 'Unauthorized', CORS_HEADERS);
        }

        break;
    }
    return handleResponse(200, 'Websocket connected successfully', headers);
  } catch (error) {
    console.error('Error connecting socket:', error.message);
    return handleResponse(500, 'Internal Server Error', CORS_HEADERS);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
