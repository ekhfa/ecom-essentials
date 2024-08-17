import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

export const authenticateAndAuthorizeMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies?.token;
  //console.log("Auth Token ===> ", req.cookies.token);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Token not found" });
  }

  try {
    const decodedToken: any = jwt.verify(token, "ekh12") as JwtPayload;

    if (!decodedToken.userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decodedToken.userId;

    const userProfile = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        role: true,
      },
    });

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }
    if (userProfile.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admin can perform this action" });
    }
    //res.status(200).json(userProfile);
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
