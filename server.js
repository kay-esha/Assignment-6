const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const collegeData = require("./modules/collegeData");
const exphbs = require("express-handlebars");

dotenv.config(); // Load environment variables from .env file

const app = express();

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Setup Handlebars with custom helpers
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: function (url, options) {
        return (
          '<li' +
          (url == app.locals.activeRoute
            ? ' class="nav-item active" '
            : ' class="nav-item" ') +
          '><a class="nav-link" href="' +
          url +
          '">' +
          options.fn(this) +
          "</a></li>"
        );
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
app.set("views", path.join(__dirname, "views"));

// Middleware to set the active route
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute =
    "/" +
    (isNaN(route.split("/")[1])
      ? route.replace(/\/(?!.*)/, "")
      : route.replace(/\/(.*)/, ""));
  next();
});

// GET route to return the home.hbs file
app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

// GET route to return the about.hbs file
app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

// GET route to return the htmlDemo.hbs file
app.get("/htmlDemo", (req, res) => {
  res.render("htmlDemo", { title: "HTML Demo" });
});

// GET route to return all students or students by course
app.get("/students", (req, res) => {
  if (req.query.course) {
    collegeData
      .getStudentsByCourse(req.query.course)
      .then((data) => {
        if (data.length > 0) {
          res.render("students", { students: data });
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => {
        console.error(err);
        res.render("students", { message: "no results" });
      });
  } else {
    collegeData
      .getAllStudents()
      .then((data) => {
        if (data.length > 0) {
          res.render("students", { students: data });
        } else {
          res.render("students", { message: "no results" });
        }
      })
      .catch((err) => {
        console.error(err);
        res.render("students", { message: "no results" });
      });
  }
});

// GET route to return all courses
app.get("/courses", (req, res) => {
  collegeData
    .getCourses()
    .then((data) => {
      if (data.length > 0) {
        res.render("courses", { courses: data });
      } else {
        res.render("courses", { message: "no results" });
      }
    })
    .catch((err) => {
      console.error(err);
      res.render("courses", { message: "no results" });
    });
});

// GET route to return a specific course by id
app.get("/course/:id", (req, res) => {
  collegeData
    .getCourseById(req.params.id)
    .then((data) => {
      if (data) {
        res.render("course", { course: data });
      } else {
        res.status(404).send("Course Not Found");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(404).send("Course Not Found");
    });
});

// GET route to add a course
app.get("/courses/add", (req, res) => {
  res.render("addCourse", { title: "Add Course" });
});

// POST route to add a course
app.post("/courses/add", (req, res) => {
  collegeData
    .addCourse(req.body)
    .then(() => {
      res.redirect("/courses");
    })
    .catch((err) => {
      console.error("Error adding course:", err);
      res.status(500).send("Unable to add course");
    });
});

// POST route to update a course
app.post("/course/update", (req, res) => {
  collegeData
    .updateCourse(req.body)
    .then(() => {
      res.redirect("/courses");
    })
    .catch((err) => {
      console.error("Error updating course:", err);
      res.status(500).send("Unable to update course");
    });
});

// GET route to delete a course
app.get("/course/delete/:id", (req, res) => {
  collegeData
    .deleteCourseById(req.params.id)
    .then(() => {
      res.redirect("/courses");
    })
    .catch((err) => {
      console.error("Error deleting course:", err);
      res.status(500).send("Unable to Remove Course / Course not found");
    });
});

// GET route to delete a student by student number
app.get("/student/delete/:studentNum", (req, res) => {
  collegeData
    .deleteStudentByNum(req.params.studentNum)
    .then(() => {
      res.redirect("/students");
    })
    .catch((err) => {
      console.error("Error deleting student:", err);
      res.status(500).send("Unable to Remove Student / Student not found");
    });
});

// GET route to return addStudent.hbs
app.get("/students/add", (req, res) => {
  collegeData
    .getCourses()
    .then((data) => {
      res.render("addStudent", { courses: data });
    })
    .catch((err) => {
      console.error(err);
      res.render("addStudent", { courses: [] });
    });
});

// GET route to return a student by student number
app.get("/student/:studentNum", (req, res) => {
  // Initialize an empty object to store the values
  let viewData = {};

  collegeData
    .getStudentByNum(req.params.studentNum)
    .then((data) => {
      if (data) {
        viewData.student = data; // Store student data in the "viewData" object as "student"
      } else {
        viewData.student = null; // Set student to null if none were returned
      }
    })
    .catch((err) => {
      viewData.student = null; // Set student to null if there was an error
    })
    .then(collegeData.getCourses)
    .then((data) => {
      viewData.courses = data; // Store course data in the "viewData" object as "courses"

      // Loop through viewData.courses and once we have found the courseId that matches
      // the student's "course" value, add a "selected" property to the matching viewData.courses object
      for (let i = 0; i < viewData.courses.length; i++) {
        if (viewData.courses[i].courseId == viewData.student.course) {
          viewData.courses[i].selected = true;
        }
      }
    })
    .catch((err) => {
      viewData.courses = []; // Set courses to empty if there was an error
    })
    .then(() => {
      if (viewData.student == null) {
        // If no student, return an error
        res.status(404).send("Student Not Found");
      } else {
        res.render("student", { viewData: viewData }); // Render the "student" view
      }
    });
});

// POST route to update a student
app.post("/student/update", (req, res) => {
  collegeData
    .updateStudent(req.body)
    .then(() => {
      res.redirect("/students");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Unable to update student");
    });
});

// POST route to handle form submission for adding a student
app.post("/students/add", (req, res) => {
  collegeData
    .addStudent(req.body)
    .then(() => {
      res.redirect("/students"); // Redirect to the student listing page
    })
    .catch((err) => {
      console.error("Error adding student:", err);
      res.sendStatus(500); // Internal server error if something goes wrong
    });
});

// Handle 404 errors
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// Initialize the data and start the server
collegeData
  .initialize()
  .then(() => {
    app.listen(8080, () => {
      console.log("Server is running on http://localhost:8080");
    });
  })
  .catch((err) => {
    console.error("Unable to start server:", err.message);
  });

// Export the app for Vercel
module.exports = app;
