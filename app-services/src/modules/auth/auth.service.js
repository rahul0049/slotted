import bcrypt from "bcrypt";
import { createUser,findUserByEmail, storeRefreshToken,findUserById,getStoredRefreshToken,deleteRefreshToken } from "./auth.repository.js";
import { verifyAccessToken,signAccessToken,signRefreshToken, verifyRefreshToken } from "../../shared/utils/jwt.js";


const SALT_ROUNDS = 10;
const REFRESH_TTL_SECONDS = 7*24*60*60;

export const signup = async ({name,email,password})=>{
    const existing = await findUserByEmail(email);
    if(existing) {
        const err = new Error('Email already registered');
        err.status=409;
        throw err;
    }
    const passwordHash = await bcrypt.hash(password,SALT_ROUNDS);
    const user = await createUser({name,email,passwordHash});
    const payload = {sub:user.id,role:user.role};
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await storeRefreshToken(user.id,refreshToken,REFRESH_TTL_SECONDS);
    return {user,accessToken,refreshToken};
}

export const login = async ({email,password})=>{
    const user =await findUserByEmail(email);
    if(!user){
        const err= new Error('Invalid email id or password ');
        err.status=401;
        throw err;
    }
    const isMatch = await bcrypt.compare(password,user.password_hash);
     if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.status = 401;
    throw err;
  }
    const payload = {sub:user.id,role:user.role};
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await storeRefreshToken(user.id,refreshToken,REFRESH_TTL_SECONDS);
    const {password_hash,...safeUser} = user ;
    return {user:safeUser,accessToken,refreshToken};
}

export const refresh = async (refreshToken) => {
    let decoded;
    try {
        decoded = verifyRefreshToken(refreshToken);
    } catch {
        const err = new Error('Invalid or expired refresh token');
        err.status = 401;
        throw err;
    }
    const userId = decoded.sub;
    const stored = await getStoredRefreshToken(userId);
    if (!stored || stored !== refreshToken) {
        const err = new Error('Refresh token invalid or revoked');
        err.status = 401;
        throw err;
    }

    const user = await findUserById({id:userId});
    if (!user) {
        const err = new Error('User no longer exists');
        err.status = 401;
        throw err;
    }

  const payload = { sub: user.id, role: user.role };
  const newAccessToken = signAccessToken(payload);
  const newRefreshToken = signRefreshToken(payload);

  // rotation: overwrite old refresh token with the new one
  await storeRefreshToken(user.id, newRefreshToken, REFRESH_TTL_SECONDS);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}

export const logout = async (refreshToken) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return; // already invalid/expired, nothing to clean up
  }
  await deleteRefreshToken(decoded.sub);
};