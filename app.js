const express = require("express");

const app = express();
//console.log(app);

const middleWare = express.json();
//console.log(middleWare);

app.use(express.json());

const sqlite = require("sqlite");
//console.log(sqlite.open);

const sqlite3 = require("sqlite3");

const path = require("path");
//console.log(path.join);
const dateFormat = require("date-fns/format");
//const addDays = require("date-fns/addDays");
var isValid = require("date-fns/isValid");

const filePath = path.join(__dirname, "todoApplication.db");
//console.log(filePath);

let db = null;
//function dbConnectionObj  ()async{
const dbConnectionObj = async () => {
  try {
    db = await sqlite.open({ filename: filePath, driver: sqlite3.Database });
    //console.log(db);
  } catch (e) {
    console.log(e.message);
  }
};

dbConnectionObj();

app.listen(3000, () => {
  console.log("server running");
});

//api call 1
const changeFunc = (response) => {
  return {
    id: response.id,
    todo: response.todo,
    priority: response.priority,
    status: response.status,
    category: response.category,
    dueDate: response.due_date,
  };
};

app.get("/todos/", async (req, res) => {
  //console.log(req);
  const { todo, priority, status, category, search_q } = req.query;
  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    if (!statusArray.includes(status)) {
      res.status(400);
      res.send("Invalid Todo Status");
    } else {
      const query = `
          select * from todo where status='${status}';`;
      const response = await db.all(query);
      const snakeToCamel = response.map((each) => changeFunc(each));
      res.send(snakeToCamel);
    }
  } else if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    if (!priorityArray.includes(priority)) {
      res.status(400);
      res.send("Invalid Todo Priority");
    } else {
      const query = `
                select * from todo where priority='${priority}';`;
      const response = await db.all(query);
      const snakeToCamel = response.map((each) => changeFunc(each));
      res.send(snakeToCamel);
    }
  } else if (priority !== undefined && status !== undefined) {
    const query = `
          select * from todo where priority='${priority}' and status='${status}';`;
    const response = await db.all(query);
    const snakeToCamel = response.map((each) => changeFunc(each));
    res.send(snakeToCamel);
  } else if (search_q !== undefined) {
    const query = `
          select * from todo where todo like '%${search_q}%';`;
    const response = await db.all(query);
    const snakeToCamel = response.map((each) => changeFunc(each));
    res.send(snakeToCamel);
  } else if (category !== undefined && status !== undefined) {
    const query = `
          select * from todo where 
          category='${category}' and status='${status}';`;
    const response = await db.all(query);
    const snakeToCamel = response.map((each) => changeFunc(each));
    res.send(snakeToCamel);
  } else if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    if (!categoryArray.includes(category)) {
      res.status(400);
      res.send("Invalid Todo Category");
    } else {
      const query = `
          select * from todo where 
          category='${category}';`;
      const response = await db.all(query);
      const snakeToCamel = response.map((each) => changeFunc(each));
      res.send(snakeToCamel);
    }
  } else if (category !== undefined && priority !== undefined) {
    const query = `
          select * from todo where 
          category='${category}' and priority='${priority}';`;
    const response = await db.all(query);
    const snakeToCamel = response.map((each) => changeFunc(each));
    res.send(snakeToCamel);
  } else {
    const query = `
          select * from todo;`;
    const response = await db.all(query);
    const snakeToCamel = response.map((each) => changeFunc(each));
    res.send(snakeToCamel);
  }
});

//API call 2

app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const query = `
         SELECT * FROM todo
           WHERE id=${todoId};`;
  const response = await db.get(query);
  //const snakeToCamel = response.map((each) => changeFunc(each));
  //res.send(snakeToCamel);
  res.send({
    id: response.id,
    todo: response.todo,
    priority: response.priority,
    status: response.status,
    category: response.category,
    dueDate: response.due_date,
  });
});

//API call 3

app.get("/agenda/", async (req, res) => {
  const { date } = req.query;
  try {
    const formateDate = dateFormat(new Date(date), "yyyy-MM-dd");
    if (isValid(new Date(date))) {
      const query = `
         SELECT * FROM todo
           WHERE due_date='${formateDate}';`;
      const response = await db.all(query);
      const snakeToCamel = response.map((each) => changeFunc(each));
      res.send(snakeToCamel);
    }
  } catch (e) {
    res.status(400);
    res.send("Invalid Due Date");
  }
});

//API call 4

app.post("/todos/", async (req, res) => {
  const { id, todo, priority, status, category, dueDate } = req.body;
  const priorityArray = ["HIGH", "MEDIUM", "LOW"];
  const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
  const categoryArray = ["WORK", "HOME", "LEARNING"];
  if (!statusArray.includes(status)) {
    res.status(400);
    res.send("Invalid Todo Status");
  } else if (!priorityArray.includes(priority)) {
    res.status(400);
    res.send("Invalid Todo Priority");
  } else if (!categoryArray.includes(category)) {
    res.status(400);
    res.send("Invalid Todo Category");
  } else if (!isValid(new Date(dueDate))) {
    res.status(400);
    res.send("Invalid Due Date");
  } else {
    const query = `
       INSERT INTO  todo(id,todo,priority,status,category,due_date)
       values(${id},'${todo}','${priority}','${status}','${category}','${dueDate}'
       );`;
    const response = await db.run(query);
    res.send("Todo Successfully Added");
  }
});

//API call 5

app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const { status, priority, todo, category, dueDate } = req.body;
  if (status !== undefined) {
    const statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    if (!statusArray.includes(status)) {
      res.status(400);
      res.send("Invalid Todo Status");
    } else {
      const query = `
            UPDATE todo SET
             status='${status}';`;
      const response = await db.run(query);
      res.send("Status Updated");
    }
  } else if (priority !== undefined) {
    const priorityArray = ["HIGH", "MEDIUM", "LOW"];
    if (!priorityArray.includes(priority)) {
      res.status(400);
      res.send("Invalid Todo Priority");
    } else {
      const query = `
            UPDATE todo SET
             priority='${priority}';`;
      const response = await db.run(query);
      res.send("Priority Updated");
    }
  } else if (todo !== undefined) {
    const query = `
            UPDATE todo SET
             todo='${todo}';`;
    const response = await db.run(query);
    res.send("Todo Updated");
  } else if (category !== undefined) {
    const categoryArray = ["WORK", "HOME", "LEARNING"];
    if (!categoryArray.includes(category)) {
      res.status(400);
      res.send("Invalid Todo Category");
    } else {
      const query = `
            UPDATE todo SET
             category='${category}';`;
      const response = await db.run(query);
      res.send("Category Updated");
    }
  } else if (dueDate !== undefined) {
    if (isValid(new Date(dueDate))) {
      const query = `
            UPDATE todo SET
             due_date='${dueDate}';`;
      const response = await db.run(query);
      res.send("Due Date Updated");
    } else {
      res.status(400);
      res.send("Invalid Due Date");
    }
  }
});

//API call 6

app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const query = `
          DELETE FROM todo
          WHERE id=${todoId};`;
  const response = await db.run(query);
  res.send("Todo Deleted");
});

module.exports = app;
