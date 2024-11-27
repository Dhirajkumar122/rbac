import { DataTypes, ENUM, STRING } from 'sequelize';
import { sequelize } from '../config/db.js';

export const rbacschema = sequelize.define('rbac_data_table', {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true, 
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING, 
         allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        allowNull: false,
        defaultValue: 'user' 
    }
    
}, {
    tableName: 'rbac_data_table', 
    timestamps: true,   
});

 

export default rbacschema;
