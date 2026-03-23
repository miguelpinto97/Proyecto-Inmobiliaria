import jwt from 'jsonwebtoken';

export const verifyToken = (event: any) => {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
  } catch (error) {
    return null;
  }
};

export const isAdmin = (user: any) => {
  return user && user.roles && user.roles.includes('Admin');
};
