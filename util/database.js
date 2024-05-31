const Sequelize = require('sequelize');

const sequelize = new Sequelize ('expenses', 'root', 'Vaibhav@123', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;