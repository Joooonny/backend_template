import express, { Request, Response } from "express";
import * as bcrypt from "bcrypt";
import { User, getUserModel } from "./User";
import { compare } from "bcrypt";
import { generateJwtToken } from "./utils";
import mongoose, { Model } from "mongoose";
import { authorization } from "./authorizationMiddleware";
import swagger from "swagger-ui-express";
import yaml from "yamljs";
const PORT = 3000;
const index = express();

const openapi = yaml.load("./openapi.yaml");

index.use("/api-docs", swagger.serve, swagger.setup(openapi));

index.use(express.json());

let userModel: Model<User, any, any>;
export const connection = async () =>
  mongoose.createConnection("mongodb://localhost:27017/testt", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

index.get("/status", (_, res: Response) => {
  res.status(200).json({ message: "Server is running" });
});

index.post(
  "/register",
  async ({ body: { email, password } }: Request, res: Response) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const alreadyExist = (await userModel.count({ email })) > 0;
      return res.status(alreadyExist ? 409 : 201).json(
        alreadyExist
          ? { message: "User already exists" }
          : await (
              await getUserModel()
            ).create({
              email,
              password: hashedPassword,
            })
      );
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

index.post("/login", async ({ body: { email, password } }: Request, res) => {
  const user = (await userModel.findOne({ email })) as User | undefined;
  !user || !(await compare(password, user.password))
    ? res.status(401).json({ message: "Invalid credentials" })
    : res.status(200).json(generateJwtToken({ userId: String(user._id) }));
});

index.get("/me", authorization, async (_, res: Response) => {
  const {
    locals: { userId },
  } = res;
  const user = (await userModel.findById(userId)) as User | undefined;
  return user
    ? res.status(200).json(user)
    : res.status(404).json({ message: "User not found" });
});

index.listen(PORT, async () => {
  userModel = await getUserModel();
  console.log(`Server listening on port ${PORT}`);
});
