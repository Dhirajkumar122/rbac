import jwt from "jsonwebtoken";

export const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        if (decoded.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        next(); 
    } catch (err) {
      console.log(err);  
      return res.status(401).json({ message: "Invalid or expired token" });
        
    }
};


export const authenticateToken=(req, res, next)=> {
    const token = req.header('Authorization')?.split(' ')[1]; 
    if (!token) {
      return res.status(401).send({ message: 'Access Denied. No token provided.' });
    }
  
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: 'Invalid token.' });
      }
      req.user = decoded; // Attach the decoded token data to the request object
      next(); // Proceed to the next middleware or route handler
    });
  }


