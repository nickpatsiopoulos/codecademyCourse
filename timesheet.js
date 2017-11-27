const timesheetRouter = require('express').Router({mergeParams: true});
module.exports = timesheetRouter;


const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


timesheetRouter.param('timesheetId', (req, res, next, timesheetId) => {
  const Sql = "SELECT * FROM Timesheet WHERE id=$timesheetId";
  const Values = {$timesheetId: timesheetId};
  db.get(Sql,Values, (error, timesheet) => {
    if(error) {
      next(error);
    } else if (timesheet){
      req.timesheet = timesheet;
      next();
    } else {
      res.status(404).send();
    }
  });
});


timesheetRouter.get('/', (req, res, next) => {
  const Sql = "SELECT * FROM Timesheet WHERE employee_id = $employeeId";
  const Values = {$employeeId: req.params.employeeId};
  db.all(Sql, Values, (err, timesheets) => {
    if(err) {
    next(err);
    } else {
    res.status(200).json({timesheets: timesheets});
   }
 });
});


timesheetRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.body.timesheet.employeeId;
  const Sql = "SELECT * FROM Employee WHERE id = $employeeId";
  const Values = {$employeeId: employeeId};
  db.get(Sql, Values, (error, employee) => {
    if (error) {
      next(error);
    } else {
      if (!hours || !rate || !date) {
        return res.sendStatus(400);
      }

      const insertSql = "INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)";
      const insertValues = {
        $hours: hours,
        $rate: rate,
        $date: date,
        $employeeId: req.params.employeeId
      };
      db.run(insertSql, insertValues, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`,
            (error, timesheet) => {
              res.status(201).json({timesheet: timesheet});
          });
        }
      });
    }
  });
});


timesheetRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours,
        rate = req.body.timesheet.rate,
        date = req.body.timesheet.date,
        employeeId = req.body.timesheet.employeeId;
  const Sql = "SELECT * FROM Timesheet WHERE id = $timesheetId";
  const Values = {$timesheetId: req.params.timesheetId};
  db.get(Sql, Values, (error, timesheet) => {
    if (error) {
      next(error);
    } else {
      if (!hours || !rate || !date || !employeeId) {
        return res.sendStatus(400);
      }
      const updateSql = "UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $timesheetId";
      const updateValues = {$date: date, $hours: hours, $rate: rate, $employeeId: employeeId, $timesheetId: req.params.timesheetId}
      db.run(updateSql, updateValues, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE id = ${req.params.timesheetId}`,
            (error, timesheet) => {
              res.status(200).json({timesheet: timesheet});
          });
        }
      });
    }
  });
});


timesheetRouter.delete('/:timesheetId', (req, res, next) => {
  const Sql = "DELETE FROM Timesheet WHERE id = $timesheetId";
  const Values = {$timesheetId: req.params.timesheetId};
  db.run(Sql, Values, (error) => {
    if (error) {
      next(error);
    } else {
    res.sendStatus(204);
    }
  });
});


timesheetRouter.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).send(err.message);
  console.log(err.message);
});
