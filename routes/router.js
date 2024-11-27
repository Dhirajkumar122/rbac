// routes
import { Router } from 'express';
import {registerUser,login,getAllUsers,updateUserRole,getUserData, deleteUser, updateProfile} from '../controller/rbaccontrollers.js';
import {authenticateAdmin,authenticateToken} from '../middlewares/adminauth.js';
const router = Router();

//Register or create a new user
router.post('/register',registerUser);
//Login user and generate access jwt token
router.post('/login',login);
//get data of logged in user on the basis of the jwt oken
router.get('/user/data',  getUserData);
// getting all the data for the admin role
router.get("/admin/users", authenticateAdmin, getAllUsers);
// updating the userr rle after verifying the user is user or admin
router.put("/user/updateRole", authenticateAdmin, updateUserRole); 
// delete user only if your admin
router.delete('/user/delete/:id', authenticateAdmin, deleteUser);
// update user details
router.put('/user/update', updateProfile)

export { router };
