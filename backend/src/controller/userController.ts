import { PrismaClient } from "@prisma/client";
import { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";

const prisma = new PrismaClient();

export const testRoute = (req: Request, res: Response) => {
  try {
    console.log("Test route accessed");
    res.send({ msg: "User hello" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const userRegistration = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        error: "Registration failed",
        message: "Email already exists. Please use a different email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isManual: true,
        role: "user",
      },
    });

    res.status(200).json({ message: "Registration Successful!" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const googleUserRegistration = async (req: Request, res: Response) => {
  try {
    const { email, name, aud } = req.body;
    const googleAuthUser = await prisma.user.upsert({
      where: {
        email: email,
      },
      update: {
        name: name,
        token: aud,
        isManual: false,
        password: aud,
      },
      create: {
        email: email,
        name: name,
        token: aud,
        isManual: false,
        password: aud,
      },
    });

    const token = jwt.sign({ userId: googleAuthUser.id }, "ekh12", {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Google Authentication Successful!",
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const userLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Please provide email and password" });
    }

    const userData = await prisma.user.findFirst({
      where: { email: email },
    });

    if (!userData) {
      return res.status(404).json({ msg: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (passwordMatch) {
      const token = jwt.sign({ userId: userData.id }, "ekh12", {
        expiresIn: "1h",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });

      return res.status(200).json({
        message: "Login Successful!",
        token,
      });
    } else {
      return res.status(401).json({ msg: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const userLogOut = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout Successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const userPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = await prisma.user.findFirst({
      where: { email: email },
    });

    if (!userData?.email) {
      return res.status(404).json({ error: "User not found" });
    }
    if (userData.email === email) {
      if (password !== confirmPassword) {
        res.status(400).json({ error: "Password do not match!" });
      }
    }

    await prisma.user.update({
      where: { email: email },
      data: {
        password: hashedPassword,
      },
    });
    res.status(200).json({ message: "Password Updated Successfully!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server Error" });
  }
};

export const userProfile = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    //console.log("User Profile Token:", token);

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

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
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server Error" });
  }
};
