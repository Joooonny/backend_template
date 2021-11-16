import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authConfig } from './config';
const { audience, secretKey, issuer } = authConfig;
export const authorization = (
  { headers }: Request,
  res: Response,
  next: NextFunction
): void => {
  jwt.verify(
    String(
      Array.isArray(headers.authorization?.split(" "))
        ? headers.authorization?.split(" ")[1]
        : undefined
    ),
    secretKey,
    { audience, issuer },
    (err, decoded) => {
      if (err) return res.status(401).json({ message: "Not authorized" });
      if (decoded) {
        res.locals = {
          ...res.locals,
          ...decoded,
        };
        next();
      }
    }
  );
};
