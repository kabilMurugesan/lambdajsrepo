import { randomBytes } from "crypto";

const clientSecretLength = 90;
const clientIdLength = 40;

export const generateclientId = (
  size = clientIdLength,
  format: BufferEncoding = "base64"
) => {
  const buffer = randomBytes(size);
  return buffer.toString(format);
};

export const generateClientSecret = (
  size = clientSecretLength,
  format: BufferEncoding = "base64"
) => {
  const buffer = randomBytes(size);
  return buffer.toString(format);
};

export const generateWalletAccountNumber = () => {
  return "W" + String(Math.random()).substring(2, 11);
};
