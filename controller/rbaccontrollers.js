import express from "express";
import bcrypt from 'bcryptjs';
import { rbacschema } from '../models/rbacmodel.js';
import jwt from 'jsonwebtoken';

// Create new user
export const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, confirm_password } = req.body;

    // Validation: check if passwords match
    if (password !== confirm_password) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Check if the user already exists
    const existingUser = await rbacschema.findOne({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Set the role based on the email
    const role = email === 'admin@gmail.com' ? 'admin' : 'user';

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user with the appropriate role (no confirm_password here)
    try {
        const newUser = await rbacschema.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            role: role,
        });

        // Send the response with user data (without password)
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser.id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                role: newUser.role,
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong during registration' });
    }
};

// Logged in as existing User
export const login = async (req, res) => {
    const { email, password } = req.body;

    // Validation: Ensure email and password are provided
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if the user exists
    const user = await rbacschema.findOne({ where: { email } });

    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create a JWT token
    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    // Send the response with the user data and JWT token
    res.status(200).json({
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        }
    });
};

// Getting the data of the user which is logged in
export const getUserData = async (req, res) => {
    try {
        // Step 1: Extract the token from the Authorization header
        const token = req.header('Authorization')?.replace('Bearer ', ''); // Strip 'Bearer ' from token

        if (!token) {
            return res.status(401).send({ message: 'No token provided.' });
        }

        // Step 2: Verify and decode the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decoding the token and extracting userId

        // Step 3: Fetch the user based on the decoded userId
        const user = await rbacschema.findOne({
            where: { id: decoded.userId }, // Find the user by userId
            attributes: { exclude: ['password'] }, // Exclude the password field
        });

        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }

        // Step 4: Return the user data (excluding password)
        res.status(200).json(user); // Send back the user data as response
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Server error.' });
    }
};

// getting all the data for the Admin 
export const getAllUsers = async (req, res) => {
    try {
        // Get all users from the database
        const users = await rbacschema.findAll();

        res.status(200).json({ users });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};


// Updating the user role
export const updateUserRole = async (req, res) => {
    const { id, newRole } = req.body;

    // Basic validation for input fields
    if (!id || !newRole) {
        return res.status(400).json({ message: "ID and new role are required" });
    }

    try {
        // Find the user by id
        const user = await rbacschema.findOne({ where: { id } });

        // If user not found
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the new role is valid (optional: depends on your application's role structure)
        //   const validRoles = ['admin', 'user'];
        //   if (!validRoles.includes(newRole)) {
        //     return res.status(400).json({ message: "Invalid role provided" });
        //   }

        // Update the role
        user.role = newRole;
        // Save the updated user record to the database
        await user.save();

        // Send a success response
        res.status(200).json({ message: "User role updated successfully", user });
    } catch (err) {
        console.error(err);  // Log the error for debugging purposes
        res.status(500).json({ message: "Error updating user role" });
    }
};


export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const deletedUser = await rbacschema.destroy({
            where: {
                id: userId  // Assuming the primary key is 'id'
            }
        });
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(err);  // Log the error for debugging purposes
        res.status(500).json({ message: "Error In deleting  user" });
    }
};



// update user details
export const updateProfile = async (req, res) => {
    const { firstName, lastName } = req.body;
  
    // Basic validation for input fields
    if (!firstName || !lastName) {
      return res.status(400).json({ message: "First name and last name are required" });
    }
  
    // Get token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: "Authorization token is missing" });
    }
  
    try {
      // Verify the JWT token and decode it to get the user data
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Make sure JWT_SECRET is correct

      // Access the userId from the decoded token
      const userId = decoded.userId;  
  
      if (!userId) {
        return res.status(401).json({ message: 'Invalid or missing user ID in token' });
      }
  
      // Find the user by ID in the database
      const user = await rbacschema.findOne({ where: { id: userId } });
  
      // If user not found
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Update the user's firstName and lastName
      user.firstName = firstName;
      user.lastName = lastName;
  
      // Save the updated user record to the database
      await user.save();
  
      // Send a success response with the updated user data
      res.status(200).json({ message: "Profile updated successfully", user });
    } catch (err) {
      console.error(err); 
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      res.status(500).json({ message: "Error updating profile" });
    }
};


