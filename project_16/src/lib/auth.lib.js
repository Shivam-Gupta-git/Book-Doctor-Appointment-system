import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

// Generate JWT token
export const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Set auth cookie
export const setAuthCookie = (token) => {
  try {
    const cookieStore = cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
  } catch (error) {
    console.error("Error setting cookie:", error);
  }
};

// Get auth token from cookie
export const getAuthToken = () => {
  try {
    const cookieStore = cookies();
    return cookieStore.get("auth-token")?.value || null;
  } catch (error) {
    console.error("Error getting cookie:", error);
    return null;
  }
};

// Remove auth cookie
export const removeAuthCookie = () => {
  try {
    const cookieStore = cookies();
    cookieStore.delete("auth-token");
  } catch (error) {
    console.error("Error removing cookie:", error);
  }
};

// Get current user from token
export const getCurrentUser = async () => {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    return decoded;
  } catch (error) {
    return null;
  }
};
