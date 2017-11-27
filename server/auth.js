import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const createTokens = async (user, secret, secret2) => {
  const { id, isAdmin } = user;
  const createToken = jwt.sign({ user: { id, isAdmin } }, secret, {
    expiresIn: '1h',
  });

  const createRefreshToken = jwt.sign({ user: { id } }, secret2, {
    expiresIn: '7d',
  });

  return [createToken, createRefreshToken];
};

export const refreshTokens = async (
  token,
  refreshToken,
  models,
  SECRET,
  SECRET2,
) => {
  let userId = 0;
  console.log(refreshToken);
  try {
    const { user: { id } } = jwt.decode(refreshToken);
    userId = id;
  } catch (err) {
    return {};
  }

  if (!userId) {
    return {};
  }
  console.log('2');
  const user = await models.User.findOne({ where: { id: userId }, raw: true });

  if (!user) {
    return {};
  }

  const refreshSecret = user.password + SECRET2;
  console.log('3');
  try {
    jwt.verify(refreshToken, refreshSecret);
  } catch (err) {
    return {};
  }
  console.log('4');
  const [newToken, newRefreshToken] = await createTokens(
    user,
    SECRET,
    user.refreshSecret,
  );
  console.log('5');
  return {
    token: newToken,
    refreshToken: newRefreshToken,
    user,
  };
};

export const tryLogin = async (email, password, models, SECRET, SECRET2) => {
  const user = await models.User.findOne({ where: { email }, raw: true });
  if (!user) {
    // user with provided email not found
    return {
      ok: false,
      errors: [{ path: 'email', message: 'Wrong email' }],
    };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    // bad password
    return {
      ok: false,
      errors: [{ path: 'password', message: 'Wrong password' }],
    };
  }

  const refreshTokenSecret = `${user.password}${SECRET2}`;

  const [token, refreshToken] = await createTokens(
    user,
    SECRET,
    refreshTokenSecret,
  );

  return {
    ok: true,
    token,
    refreshToken,
  };
};
