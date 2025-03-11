const projectData = require("../data/projectData");
const sectorData = require("../data/sectorData");

let projects = [];

function initialize() {
    return new Promise((resolve, reject) => {
        try {
            projects = projectData.map(project => {
                const sector = sectorData.find(sector => sector.id === project.sector_id);
                return { ...project, sector: sector ? sector.sector_name : "Unknown" };
            });
            resolve();
        } catch (error) {
            reject("Error initializing project data.");
        }
    });
}

function getAllProjects() {
    return new Promise((resolve, reject) => {
        if (projects.length > 0) {
            resolve(projects);
        } else {
            reject("No project data available.");
        }
    });
}

function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
        const project = projects.find(p => p.id === projectId);
        if (project) {
            resolve(project);
        } else {
            reject(`Project with ID ${projectId} not found.`);
        }
    });
}

function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
        const matchingProjects = projects.filter(p => 
            p.sector.toLowerCase().includes(sector.toLowerCase())
        );
        if (matchingProjects.length > 0) {
            resolve(matchingProjects);
        } else {
            reject(`No projects found for sector containing '${sector}'.`);
        }
    });
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };
