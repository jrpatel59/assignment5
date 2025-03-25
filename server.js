/********************************************************************************
* WEB322 – Assignment 05
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Jeet Patel Student ID: 164040230 Date: 25 March, 2025
*
********************************************************************************/

const express = require("express");
const path = require("path");
const projectData = require("./modules/projects");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));

// Add new routes
app.get('/solutions/addProject', (req, res) => {
    projectData.getAllSectors()
      .then(sectors => res.render('addProject', { sectors }))
      .catch(err => res.status(500).render('500', { message: err }));
  });
  
  app.post('/solutions/addProject', (req, res) => {
    projectData.addProject(req.body)
      .then(() => res.redirect('/solutions/projects'))
      .catch(err => res.render('500', { message: err }));
  });
  
  app.get('/solutions/editProject/:id', (req, res) => {
    Promise.all([
      projectData.getProjectById(req.params.id),
      projectData.getAllSectors()
    ])
    .then(([project, sectors]) => res.render('editProject', { project, sectors }))
    .catch(err => res.status(404).render('404', { message: err }));
  });
  
  app.post('/solutions/editProject', (req, res) => {
    projectData.editProject(req.body.id, req.body)
      .then(() => res.redirect('/solutions/projects'))
      .catch(err => res.render('500', { message: err }));
  });
  
  app.get('/solutions/deleteProject/:id', (req, res) => {
    projectData.deleteProject(req.params.id)
      .then(() => res.redirect('/solutions/projects'))
      .catch(err => res.render('500', { message: err }));
  });

app.get("/", (req, res) => {
    res.render("home", { page: "/" });
});

app.get("/about", (req, res) => {
    res.render("about", { page: "/about" });
});

app.get('/solutions/projects', (req, res) => {
    projectData.getAllProjects()
      .then(projects => {
        // Add console.log to verify data
        console.log("Projects data:", projects);
        res.render('projects', { 
          projects,
          page: '/solutions/projects' 
        });
      })
      .catch(err => {
        console.error("Error fetching projects:", err);
        res.status(404).render('404', { 
          message: "Failed to load projects" 
        });
      });
  });
  
app.get("/solutions/projects/:id", (req, res) => {
    const projectId = parseInt(req.params.id);
    projectData.getProjectById(projectId)
        .then(project => res.render("project", { project, page: "" }))
        .catch(err => res.status(404).render("404", { message: `Project with ID ${projectId} not found.` }));
});

app.use((req, res) => {
    res.status(404).render("404", { message: "The page you are looking for doesn't exist." });
});

projectData.initialize()
    .then(() => {
        console.log("Project data initialized successfully!");
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error("Failed to initialize project data:", err);
    });