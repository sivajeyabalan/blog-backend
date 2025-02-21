const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get current user's profile
exports.getProfile = async (req, res) => {
  try {
    // Assuming auth middleware attaches the user to req.user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, createdAt: true } // Include fields you want to expose
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: `Error fetching profile: ${error.message}` });
  }
};

// Update current user's profile
exports.updateProfile = async (req, res) => {
  const { email, newPassword } = req.body; // Extend this to other fields as needed
  try {
    // For simplicity, let's assume only email and password can be updated
    const updatedData = {};
    if (email) updatedData.email = email;
    
    if (newPassword) {
      // Update password if provided
      const bcrypt = require('bcryptjs');
      updatedData.passwordHash = await bcrypt.hash(newPassword, 10);
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updatedData,
      select: { id: true, email: true, role: true }
    });
    
    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: `Error updating profile: ${error.message}` });
  }
};
