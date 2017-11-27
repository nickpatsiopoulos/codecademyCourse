const menuItemRouter = require('express').Router({mergeParams: true});
module.exports = menuItemRouter;

const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const Sql = "SELECT * FROM MenuItem WHERE id=$menuItemId";
  const Values = {$menuItemId: menuItemId};
  db.get(Sql, Values, (error, menuItem) => {
    if(error) {
      next(error);
    } else if (menuItem){
      req.menuItem = menuItem;
      next();
    } else {
      res.status(404).send();
    }
  });
});


menuItemRouter.get('/', (req, res, next) => {
  const Sql = "SELECT * FROM MenuItem WHERE menu_id = $menuId";
  const Values = {$menuId: req.params.menuId};
  db.all(Sql, Values, (err, menuItems) => {
    if(err) {
    next(err);
  } else {
    res.status(200).json({menuItems: menuItems});
   }
 });
});


menuItemRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;
        menuId = req.params.menuId;
  const Sql = "SELECT * FROM Menu WHERE id = $menuId";
  const Values = {$menuId: menuId};
  db.get(Sql, Values, (error, menu) => {
    if (error) {
      next(error);
    } else {
      if (!name || !description || !inventory || !price) {
        return res.sendStatus(400);
      }
      const insertSql = "INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)";
      const insertValues = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: req.params.menuId
      };
      db.run(insertSql, insertValues, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`,
            (error, menuItem) => {
              res.status(201).json({menuItem: menuItem});
          });
        }
      });
    }
  });
});


menuItemRouter.put('/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;
        menuId = req.body.menuItem.menuId;
        menuItemId = req.body.menuItem.id
  const Sql = "SELECT * FROM MenuItem WHERE id = $menuItemId";
  const Values = {$menuItemId: menuItemId};
  db.get(Sql, Values, (error, menuItem) => {
    if (error) {
      next(error);
    } else {
      if (!name || !description || !inventory || !price || !menuId) {
        return res.sendStatus(400);
      }
      const updateSql = "UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $menuItemId";
      const updateValues = {
        $name: name,
        $description: description,
        $inventory: inventory,
        $price: price,
        $menuId: menuId,
        $menuItemId: req.params.menuItemId
      };
      db.run(updateSql, updateValues, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`,
            (error, menuItem) => {
              res.status(200).json({menuItem: menuItem});
            });
        }
      });
    }
  });
});


menuItemRouter.delete('/:menuItemId', (req, res, next) => {
  const Sql = "DELETE FROM MenuItem WHERE id = $menuItemId";
  const Values = {$menuItemId: req.params.menuItemId};
  db.run(Sql, Values, (error) => {
    if (error) {
      next(error);
    } else {
    res.sendStatus(204);
    }
  });
});


menuItemRouter.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).send(err.message);
  console.log(err.message);
});
