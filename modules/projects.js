require("dotenv").config();

const Sequelize = require("sequelize");

// set up sequelize to point to our postgres database
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true, // This will help you connect to the database with SSL
      rejectUnauthorized: false, // Allows self-signed certificates
    },
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.log("Unable to connect to the database:", err);
  });


// Define Sector model
const Sector = sequelize.define('Sector', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sector_name: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  timestamps: false
});

// Define Project model
const Project = sequelize.define('Project', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  feature_img_url: {
    type: Sequelize.STRING,
    allowNull: false
  },
  summary_short: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  intro_short: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  impact: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  original_source_url: {
    type: Sequelize.STRING,
    allowNull: false
  },
  sector_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
}, {
  timestamps: false
});

// Define association
Project.belongsTo(Sector, { foreignKey: 'sector_id' });

// Initialize database connection
function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.sync()
      .then(() => resolve())
      .catch(err => reject(err));
  });
}

// Get all projects with their sectors
function getAllProjects() {
  return new Promise((resolve, reject) => {
    Project.findAll({
      include: [Sector]
    })
    .then(projects => {
      if (projects.length > 0) {
        resolve(projects);
      } else {
        reject("No projects found");
      }
    })
    .catch(err => reject(err));
  });
}

// Get a single project by ID
function getProjectById(projectId) {
  return new Promise((resolve, reject) => {
    Project.findAll({
      where: { id: projectId },
      include: [Sector]
    })
    .then(projects => {
      if (projects.length > 0) {
        resolve(projects[0]);
      } else {
        reject("Unable to find requested project");
      }
    })
    .catch(err => reject(err));
  });
}

// Get projects by sector
function getProjectsBySector(sector) {
  return new Promise((resolve, reject) => {
    Project.findAll({
      include: [Sector],
      where: {
        '$Sector.sector_name$': {
          [Sequelize.Op.iLike]: `%${sector}%`
        }
      }
    })
    .then(projects => {
      if (projects.length > 0) {
        resolve(projects);
      } else {
        reject(`Unable to find projects for sector: ${sector}`);
      }
    })
    .catch(err => reject(err));
  });
}

// Get all sectors
function getAllSectors() {
  return new Promise((resolve, reject) => {
    Sector.findAll()
      .then(sectors => resolve(sectors))
      .catch(err => reject(err));
  });
}

// Add a new project
function addProject(projectData) {
  return new Promise((resolve, reject) => {
    Project.create(projectData)
      .then(() => resolve())
      .catch(err => reject(err.errors[0].message));
  });
}

// Edit an existing project
function editProject(id, projectData) {
  return new Promise((resolve, reject) => {
    Project.update(projectData, {
      where: { id: id }
    })
    .then(() => resolve())
    .catch(err => reject(err.errors[0].message));
  });
}

// Delete a project
function deleteProject(id) {
  return new Promise((resolve, reject) => {
    Project.destroy({
      where: { id: id }
    })
    .then(() => resolve())
    .catch(err => reject(err.errors[0].message));
  });
}

module.exports = {
  initialize,
  getAllProjects,
  getProjectById,
  getProjectsBySector,
  getAllSectors,
  addProject,
  editProject,
  deleteProject
};