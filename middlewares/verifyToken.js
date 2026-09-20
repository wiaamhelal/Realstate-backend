const jwt = require("jsonwebtoken");

// verify token
const verifyToken = (req, res, next) => {
  const authToken = req.headers.authorization;
  if (authToken) {
    const token = authToken.split(" ")[1];
    try {
      const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decodedPayload;
      next();
    } catch (error) {
      return res.status(401).json({message: "unauthorized, invalid token"});
    }
  } else {
    return res
      .status(401)
      .json({message: "unauthorized, you need to inter the token"});
  }
};

// verfy token and admin
const verfyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res
        .status(403)
        .json({message: "its authorized by the admin only"});
    }
  });
};

// verfy token and user himself
const verfyTokenAndUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id) {
      next();
    } else {
      return res
        .status(403)
        .json({message: "its authorized by the owner only"});
    }
  });
};

// verfy token and authoraization
const verfyTokenAndAuthoriation = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return res
        .status(403)
        .json({message: "its authorized by the admin or the user himself"});
    }
  });
};

module.exports = {
  verifyToken,
  verfyTokenAndAdmin,
  verfyTokenAndUser,
  verfyTokenAndAuthoriation,
};
