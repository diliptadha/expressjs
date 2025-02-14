import { prisma } from "../prisma/prisma.js";
import bcrypt from "bcrypt";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 10),
      },
    });
    res.status(200).json({ message: "You have been registered!", user });
  } catch (error) {
    if (error.code === "P2002") {
      res.status(409).json({
        message:
          "It looks like an account with this email address already exists. Please log in instead of creating a new account.",
      });
    } else {
      res.status(500).json({ message: error.message, ...error });
    }
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!user) {
      res.status(401).json({ message: "Invalid Email or Password" });
    } else if (!bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ message: "Invalid Email or Password" });
    } else if (!user.verified) {
      res.status(401).json({ message: "User Not Verified" });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    res.status(500).json({ message: error.message, ...error });
  }
};

export const editUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userData = {};

    if (name) {
      userData.name = name;
    }

    if (email) {
      userData.email = email;
    }

    if (password) {
      userData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(userData).length === 0) {
      return res
        .status(400)
        .json({ message: "At least one field is required" });
    }
    const user = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: userData,
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message, ...error });
  }
};
