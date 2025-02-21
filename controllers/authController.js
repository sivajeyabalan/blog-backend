const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
exports.register = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Optional: Validate input fields (e.g., check email format, password strength)
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Optional: Check if a user with the same email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: password, // Using 'passwordHash' as per your schema
      },
    });
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
};



exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      
  
      return res.status(400).json({ message: "Invalid email or password"  , "sjb": "sjb"});
    }

    // Ensure passwordHash exists before comparing
    if (!user.passwordHash) {
      return res.status(500).json({ message: "Server error: User password not found" });
    }

    // Compare password with stored hash
    const isMatch = password.localeCompare(user.passwordHash);
    if (isMatch !== 0) {
  
      return res.status(400).json({ message: "Invalid email or password"  , "error" : "compare"}  );
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1D" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
};


exports.logout = async (req, res) => {
  res.json({message : 'User logged out'});
}


exports.getUser = async (req, res) => {
  try {
    // Get the token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid Token" });
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, createdAt: true }, // Send only safe data
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
  }
};
