import jwt from 'jsonwebtoken';
import { authConfig } from './config'
import mongoose from 'mongoose';
const { audience, issuer, accessTokenExpiresIn, refreshTokenExpiresIn, secretKey } = authConfig;
export const generateJwtToken = (payload: { userId: string }) => ({
  tokenType: 'bearer',
  accessToken: jwt.sign(payload, secretKey, {
    audience,
    issuer,
    expiresIn: accessTokenExpiresIn,
  }),
  expiresIn: accessTokenExpiresIn,
  refreshToken: jwt.sign(payload, secretKey, {
    audience,
    issuer,
    expiresIn: refreshTokenExpiresIn,
  }),
});

export const connection = () =>
  mongoose.createConnection(
    'mongodb://localhost:27017/testt'
  );