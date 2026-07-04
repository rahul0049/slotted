import { signup,login,refresh,logout } from './auth.service.js';
import { findUserById } from './auth.repository.js';
export const signupController = async (req, res) => {
  try {
    const {name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const { user, accessToken, refreshToken } = await signup({name,email, password });

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};



export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const { user, accessToken, refreshToken } = await login({ email, password });

    res.status(200).json({ user, accessToken, refreshToken });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const refreshController = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'refreshToken is required' });
    }
    const tokens = await refresh(refreshToken);
    res.status(200).json(tokens);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const logoutController = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'refreshToken is required' });
    }
    await logout(refreshToken);
    res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

export const meController = async (req, res) => {
  try {
    const user = await findUserById({id:req.user.id});
    res.status(200).json({ user });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};