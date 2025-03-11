/********************************************************************************
* WEB322 – Assignment 04
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Jeet Patel Student ID: 164040230 Date: 11 March, 2025
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


app.get("/", (req, res) => {
    res.render("home", { page: "/" });
});

app.get("/about", (req, res) => {
    res.render("about", { page: "/about" });
});

app.get("/solutions/projects", (req, res) => {
    const sector = req.query.sector;
    if (sector) {
        projectData.getProjectsBySector(sector)
            .then(projects => res.render("projects", { projects, page: "/solutions/projects" }))
            .catch(err => res.status(404).render("404", { message: `No projects found for sector: ${sector}` }));
    } else {
        projectData.getAllProjects()
            .then(projects => res.render("projects", { projects, page: "/solutions/projects" }))
            .catch(err => res.status(500).render("404", { message: "Failed to load projects." }));
    }
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