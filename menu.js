const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');


const menuRouter = require('express').Router();
module.exports = menuRouter;


const menuItemRouter = require('./menuitem');


menuRouter.param('menuId', (req, res, next, menuId) => {
  const Sql = "SELECT * FROM Menu WHERE id=$menuId";
  const Values = {$menuId: menuId};
  db.get(Sql, Values, (error, menu) => {
    if(error) {
      next(error);
    } else if (menu){
      req.menu = menu;
      next();
    } else {
      res.status(404).send();
    }
  });
});


menuRouter.use('/:menuId/menu-items/', menuItemRouter);


menuRouter.get('/', (req, res, next) => {
  const Sql = "SELECT * FROM Menu";
  db.all(Sql, (error, menus) => {
    if (error) {
      next(error);
    } else {
      res.status(200).json({menus: menus});
    }
  });
});


menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});


menuRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;
  const Sql = "INSERT INTO Menu (title) VALUES ($title)";
  const Values = {$title: title};
    if (!title) {
    return res.status(400).send();
  }
    db.run(Sql, Values, function(error) {
      if(error) {
        res.status(500).send();
        }
      db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`,
       (error, menu) => {
        res.status(201).json({menu: menu});
      });
    });
});


menuRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;
  const Sql = "UPDATE Menu SET title = $title WHERE id = $menuId";
  const Values = {$title: title, $menuId: req.params.menuId};
  if (!title) {
        return res.status(400).send();
      }
    db.run(Sql, Values, (error) => {
       if (error) {
         next (error);
       } else {
     db.get(`SELECT * FROM Menu WHERE id = ${req.params.menuId}`,
      (error, menu) => {
       res.status(200).json({menu: menu});
     });
    }
  });
});


menuRouter.delete('/:menuId', (req, res, next) => {
  const Sql = "SELECT * FROM MenuItem WHERE menu_id = $menuId";
  const Values = {$menuId: req.params.menuId};
  db.get(Sql, Values, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      res.sendStatus(400);
    } else {
      const deleteSql = "DELETE FROM Menu WHERE id = $menuId";
      const deleteValues = {$menuId: req.params.menuId};
      db.run(deleteSql, deleteValues, (error) => {
        if (error) {
          next(error);
        } else {
          res.sendStatus(204);
        }
      });
    }
  });
});


menuRouter.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).send(err.message);
  console.log(err.message);
});
