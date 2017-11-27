const apisRouter = require('express').Router();
module.exports = apisRouter;


const employeeRouter = require('./employee');
const menuRouter = require('./menu');


apisRouter.use('/employees', employeeRouter);
apisRouter.use('/menus', menuRouter);
