/*************************************************************************
* WEB322– Assignment 4
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part of this assignment has been copied manually or electronically from any
other source.
* (including 3rd party web sites) or distributed to other students.
*
* Name: Hetpatel  Student ID: 154671218 Date: 12th of november
*
* Your app’s URL (from Cyclic Heroku) that I can click to see your application:
* ______________________________________________
*
*************************************************************************/
var data_service = require("./data-service.js");
const exphbs = require("express-handlebars");
var port = process.env.PORT || 8080;
var express = require("express");
var app = express();
const path = require("path");
const multer = require("multer");
const fs = require("fs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: function (url, options) {
        return `<li class="nav-item">
      <a href="${url}" class="nav-link ${
          url === app.locals.activeRoute ? "text-primary" : "text-light"
        }">${options.fn(this)}</a>
      </li>`;
      },
      equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      },
    },
  })
);
app.set("view engine", ".hbs");
app.use(function (req, res, next) {
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = route == "/" ? "/" : route.replace(/\/$/, "");
  next();
});

const storage = multer.diskStorage({
  destination: "./public/images/uploaded",
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

//function for start app on 8080 port
function Start() {
  return new Promise(function (reslove, reject) {
    data_service
      .initialize()
      .then(function (data) {
        console.log(data);
      })
      .catch(function (reason) {
        console.log(reason);
      });
  });
}

app.use(express.static("public"));
//dfault path route Home page
app.get("/", function (rqust, res) {
  res.render("home");
});
// aboute bage file foute
app.get("/about", function (rqust, res) {
  res.render("about");
});
//department file route and url created departments
app.get("/departments", function (rqust, res) {
  data_service
    .getDepartments()
    .then(function (data) {
      res.render("departments", { departments: data });
    })
    .catch(function (err) {
      res.render("departments", { message: err });
    });
});
// employee file route and url employees

app.get("/employees", async function (rqust, res) {
  try {
    let dataReq;
    if (rqust.query.status) {
      dataReq = await data_service.getEmployeesByStatus(rqust.query.status);
    } else if (rqust.query.department) {
      dataReq = await data_service.getEmployeesByDepartment(
        rqust.query.department
      );
    } else if (rqust.query.manager) {
      dataReq = await data_service.getEmployeeByManager(rqust.query.manager);
    } else {
      dataReq = await data_service.getAllEmployees();
    }
    res.render("employees", { employees: dataReq });
  } catch (error) {
    res.render("employees", { message: error });
  }
});
app.get("/employee/:value", function (rqust, res) {
  data_service
    .getEmployeeByNum(rqust.params.value)
    .then(function (data) {
      res.render("employee", { employee: data });
    })
    .catch(function (err) {
      res.render("employee", { message: err });
    });
});
// manager file route and url managers
app.get("/managers", function (rqust, res) {
  data_service
    .getManagers()
    .then(function (data) {
      res.json(data);
    })
    .catch(function (err) {
      res.json({ message: err });
    });
});

app.get("/employees/add", function (rqust, res) {
  res.render("addEmployee");
});

app.post("/employees/add", function (rqust, res) {
  data_service
    .addEmployee(rqust.body)
    .then(function (data) {
      res.redirect("/employees");
    })
    .catch(function (err) {
      res.json({ message: err });
    });
});

app.post("/employee/update", function (rqust, res) {
  data_service
    .updateEmployee(rqust.body)
    .then(function (data) {
      res.redirect("/employees");
    })
    .catch(function (err) {
      res.json({ message: err });
    });
});

app.get("/images/add", function (rqust, res) {
  res.render("addImage");
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
  res.redirect("/images");
});

app.get("/images", function (rqust, res) {
  fs.readdir("./public/images/uploaded", function (err, items) {
    res.render("images", { images: items });
    console.log(items);
  });
});

app.use(function (rqust, res) {
  res.status(404).send("Page Error");
});

app.listen(port, Start);
