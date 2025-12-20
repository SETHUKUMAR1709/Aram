import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  let token;

  // 1) Authorization header
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2) Query token (for SSE)
  if (!token && req.query?.token) {
    token = req.query.token;
  }

  // 3) Cookie fallback
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};



export const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this resource' });
        }
        next();
    };
};

export default { protect, authorize };
