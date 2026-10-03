import userModel from "../models/user.model.js";
import bcrypt from "bcryptjs";
import {
  createAccessToken,
  createRefreshToken,
  readRefreshToken,
} from "../utils/auth.utils.js";


export async function register(req, res) {
  try {
    const { email, name, password, role } = req.body;

    const isUserAlreadyExists = await userModel.findOne({ email });

    if (isUserAlreadyExists) {
      return res.status(400).json({
        message: "User already exists with this email address",
        errors: [
          {
            path: "email",
            msg: "User already exists with this email address",
          },
        ],
      });
    }

    const userRole = role || "user";

    const user = await userModel.create({
      email,
      name,
      role: userRole,
      passwordHash: await bcrypt.hash(password, 12),
    });

    const accessToken = createAccessToken({
      userId: user._id,
      role: user.role,
    });
    const refreshToken = createRefreshToken({
      userId: user._id,
      role: user.role,
    });

    await userModel.findByIdAndUpdate(user._id, { refreshToken });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(201).json({
      message: "User Registered Successfully",
      data: {
        user: {
          email: user.email,
          name: user.name,
          id: user._id,
          role: user.role,
        },
        accessToken,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const userRole = user.role || "user";

    const accessToken = createAccessToken({
      userId: user._id,
      role: userRole,
    });

    const refreshToken = createRefreshToken({
      userId: user._id,
      role: userRole,
    });

    await userModel.findOneAndUpdate({ email }, { refreshToken });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(200).json({
      message: "user loggedIn successfully",
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: userRole,
        },
        accessToken,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function refresh(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token is required.",
    });
  }

  try {
    const decoded = readRefreshToken(refreshToken);
    const { userId, role } = decoded;

    const user = await userModel.findById(userId);

    if (!user || refreshToken !== user.refreshToken) {
      if (user) {
        await userModel.findByIdAndUpdate(user._id, { refreshToken: null });
      }
      return res.status(401).json({
        message: "Refresh token mismatch or invalid",
      });
    }

    const effectiveRole = user.role || role || "user";

    const newAccessToken = createAccessToken({
      userId,
      role: effectiveRole,
    });
    const newRefreshToken = createRefreshToken({
      userId,
      role: effectiveRole,
    });

    await userModel.findByIdAndUpdate(user._id, {
      refreshToken: newRefreshToken,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Tokens rotated successfully.",
      data: {
        user: {
          email: user.email,
          name: user.name,
          id: user._id,
          role: effectiveRole,
        },
        accessToken: newAccessToken,
      },
    });
  } catch (err) {
    return res.status(401).json({
      message: "Invalid refresh Token",
    });
  }
}

export async function getMe(req, res) {
  try {
    const { userId } = req.user;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User data fetch successfully",
      data: {
        user: {
          email: user.email,
          name: user.name,
          id: user._id,
          role: user.role || "user",
        },
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}