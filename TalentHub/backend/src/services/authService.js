const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Student, Company } = require('../models');

const generateToken = (user) => jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const register = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ where: { email } });
  if (existing) throw { statusCode: 409, message: 'Email already registered' };
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: hashedPassword, role });
  if (role === 'student') await Student.create({ userId: user.id });
  else if (role === 'company') await Company.create({ userId: user.id, companyName: name });
  const token = generateToken(user);
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw { statusCode: 401, message: 'Invalid email or password' };
  if (!user.isActive) throw { statusCode: 403, message: 'Account deactivated. Contact admin.' };
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw { statusCode: 401, message: 'Invalid email or password' };
  const token = generateToken(user);
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
};

const getMe = async (userId) => {
  const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
  if (!user) throw { statusCode: 404, message: 'User not found' };
  return user;
};

module.exports = { register, login, getMe };
