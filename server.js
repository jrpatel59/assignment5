require('dotenv').config();
const express = require('express');
const path = require('path');
const projectData = require('./modules/projects');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

projectData.initialize()
  .then(() => {
    console.log('Data initialized successfully');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Initialization failed:', err);
    process.exit(1);
  });

app.get('/', (req, res) => res.render('home', { page: '/' }));
app.get('/about', (req, res) => res.render('about', { page: '/about' }));

app.get('/solutions/projects', (req, res) => {
  const sector = req.query.sector;
  
  const fetchProjects = sector 
    ? projectData.getProjectsBySector(sector)
    : projectData.getAllProjects();

  fetchProjects
    .then(projects => res.render('projects', { 
      projects,
      page: '/solutions/projects',
      currentSector: sector 
    }))
    .catch(err => res.status(404).render('404', { 
      message: err.includes('Unable to find') ? err : 'Failed to load projects'
    }));
});

app.get('/solutions/projects/:id', (req, res) => {
  Promise.all([
    projectData.getProjectById(req.params.id),
    projectData.getAllProjects() 
  ])
  .then(([project, projects]) => res.render('project', { 
    project,
    projects,
    page: '' 
  }))
  .catch(err => res.status(404).render('404', { message: err }));
});

app.get('/solutions/addProject', (req, res) => {
  projectData.getAllSectors()
    .then(sectors => res.render('addProject', { sectors, page: '/solutions/addProject' }))
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
  .then(([project, sectors]) => res.render('editProject', { project, sectors, page: '' }))
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

app.use((req, res) => {
  res.status(404).render('404', { message: 'Page not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('500', { message: 'Something broke!' });
});