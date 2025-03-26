require('dotenv').config();
require('pg');
const { Sequelize, Op } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true, 
      rejectUnauthorized: false, 
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

const Sector = sequelize.define('Sector', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sector_name: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  }
}, {
  timestamps: false,
  tableName: 'Sectors'
});

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
    allowNull: false,
    validate: {
      isUrl: true
    }
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
    allowNull: false,
    validate: {
      isUrl: true
    }
  },
  sector_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Sector,
      key: 'id'
    }
  }
}, {
  timestamps: false,
  tableName: 'Projects'
});

Project.belongsTo(Sector, { foreignKey: 'sector_id' });

const sampleSectors = [
  { sector_name: 'Industry' },
  { sector_name: 'Transportation' },
  { sector_name: 'Electricity' }
];

const sampleProjects = [
  {
    title: 'Abandoned Farmland Restoration',
    feature_img_url: 'https://images.unsplash.com/photo-1615855327579-a2b9d654f682',
    summary_short: 'Restoration can bring degraded farmland back into productivity',
    intro_short: 'This project focuses on restoring abandoned farmland to productive use through sustainable practices and soil regeneration techniques.',
    impact: 'Reduces land waste by 40% and increases agricultural output by 25% in target regions',
    original_source_url: 'https://drawdown.org/solutions/abandoned-farmland-restoration'
  },
  {
    title: 'Bicycle Infrastructure',
    feature_img_url: 'https://images.unsplash.com/photo-1519219444773-9453a2f1f87c',
    summary_short: 'Developing bike lanes and parking infrastructure to support cycling',
    intro_short: 'Comprehensive urban planning initiative to make cities more bike-friendly and reduce car dependency.',
    impact: 'Reduces fossil fuel dependency by 15% and decreases traffic congestion by 20% in pilot cities',
    original_source_url: 'https://drawdown.org/solutions/bicycle-infrastructure'
  },
  {
    title: 'Solar Panel Recycling',
    feature_img_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276',
    summary_short: 'Sustainable recycling program for end-of-life solar panels',
    intro_short: 'Innovative process to recover valuable materials from decommissioned solar panels.',
    impact: 'Diverts 90% of solar panel waste from landfills and recovers 80% of reusable materials',
    original_source_url: 'https://drawdown.org/solutions/concentrated-solar-power'
  }
];

async function initializeData() {
  try {
    console.log('Checking database for existing data...');
    
    const existingSectors = await Sector.findAll();
    if (existingSectors.length === 0) {
      console.log('Creating sectors...');
      await Sector.bulkCreate(sampleSectors);
    }

    const sectors = await Sector.findAll();
    
    const existingProjects = await Project.findAll();
    if (existingProjects.length === 0) {
      console.log('Creating projects...');
      
      const projectsToCreate = sampleProjects.map((project, index) => ({
        ...project,
        sector_id: sectors[index % sectors.length].id
      }));
      
      await Project.bulkCreate(projectsToCreate);
    }

    console.log('Database initialization complete');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

function initialize() {
  return new Promise((resolve, reject) => {
    sequelize.authenticate()
      .then(() => sequelize.sync({ force: false })) 
      .then(() => initializeData())
      .then(() => resolve())
      .catch(err => reject(err));
  });
}

function getAllProjects() {
  return new Promise((resolve, reject) => {
    Project.findAll({
      include: [Sector],
      order: [['title', 'ASC']]
    })
    .then(projects => resolve(projects))
    .catch(err => reject(err));
  });
}

function getProjectById(projectId) {
  return new Promise((resolve, reject) => {
    Project.findAll({
      where: { id: projectId },
      include: [Sector],
      limit: 1
    })
    .then(projects => {
      if (projects.length > 0) {
        resolve(projects[0]);
      } else {
        reject('Unable to find requested project');
      }
    })
    .catch(err => reject(err));
  });
}

function getProjectsBySector(sector) {
  return new Promise((resolve, reject) => {
    Project.findAll({
      include: [Sector],
      where: {
        '$Sector.sector_name$': {
          [Op.iLike]: `%${sector}%`
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

function getAllSectors() {
  return new Promise((resolve, reject) => {
    Sector.findAll({
      order: [['sector_name', 'ASC']]
    })
    .then(sectors => resolve(sectors))
    .catch(err => reject(err));
  });
}

function addProject(projectData) {
  return new Promise((resolve, reject) => {
    Project.create(projectData)
      .then(() => resolve())
      .catch(err => reject(err.errors[0].message));
  });
}

function editProject(id, projectData) {
  return new Promise((resolve, reject) => {
    Project.update(projectData, {
      where: { id: id }
    })
    .then(() => resolve())
    .catch(err => reject(err.errors[0].message));
  });
}

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