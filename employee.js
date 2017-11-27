const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


const employeeRouter = require('express').Router();
module.exports = employeeRouter;


const timesheetRouter = require('./timesheet');


employeeRouter.param('employeeId', (req, res, next, employeeId) => {
  const Sql = "SELECT * FROM Employee WHERE id=$employeeId";
  const Values = {$employeeId: employeeId};
  db.get(Sql, Values, (error, employee) => {
    if(error) {
      next(error);
    } else if (employee){
      req.employee = employee;
      next();
    } else {
      res.status(404).send();
    }
  });
});


employeeRouter.use('/:employeeId/timesheets', timesheetRouter);


employeeRouter.get('/', (req, res, next) => {
  const Sql = "SELECT * FROM Employee WHERE is_current_employee = 1";
  db.all(Sql, (error, employees) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({employees: employees});
    }
  });
});


employeeRouter.get('/:employeeId', (req, res, next) => {
    res.status(200).json({employee: req.employee});
});


employeeRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        isCurrentEmployee = req.body.employee.is_current_employee === 0 ? 0 : 1;
  const Sql = "INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)";
  const Values = {$name: name, $position: position, $wage: wage, $isCurrentEmployee: isCurrentEmployee};
  if (!name || !position || !wage) {
    return res.status(400).send();
  }
    db.run(Sql, Values, function(error) {
      if(error) {
        res.status(500).send();
        }
      db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`,
       (error, employee) => {
        res.status(201).json({employee: employee});
    });
  });
});


employeeRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name,
        position = req.body.employee.position,
        wage = req.body.employee.wage,
        isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
  const Sql = "UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $employeeId";
  const Values = {$name: name, $position: position, $wage: wage, $isCurrentEmployee: isCurrentEmployee, $employeeId: req.params.employeeId};
  if (!name || !position || !wage) {
        return res.status(400).send();
      }
    db.run(Sql, Values, (error) => {
       if (error) {
         next (error);
       } else {
     db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`,
      (error, employee) => {
       res.status(200).json({employee: employee});
     });
    }
  });
});


employeeRouter.delete('/:employeeId', (req, res, next) => {
  const Sql = 'UPDATE Employee SET is_current_employee = 0 WHERE id = $employeeId';
  const Values = {$employeeId: req.params.employeeId};
  db.run(Sql, Values, (error) => {
    if (error) {
      next(error);
    } else {
      db.get(`SELECT * FROM Employee WHERE id = ${req.params.employeeId}`,
        (error, employee) => {
          res.status(200).json({employee: employee});
      });
    }
  });
});


employeeRouter.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).send(err.message);
  console.log(err.message);
});
