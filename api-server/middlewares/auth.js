const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Obtem header de autenticação
  const authHeader = req.headers.authorization;
  // Verifica se o header existe
  if (!authHeader) return res.status(401).json({ msg: 'Nenhum token, autorização negada' });

  // Divide o header em partes
  const parts = authHeader.split(' ');
  // Verifica se esta mal formatato
  if (parts.length !== 2) return res.status(401).json({ msg: 'Token mal formatado' });

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) return res.status(401).json({ msg: 'Token mal formatado' });

  try {
    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token inválido' });
  }
};
