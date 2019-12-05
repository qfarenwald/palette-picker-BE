import express from 'express';
import cors from 'cors';

const app = express();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.locals.title = 'palette picker';
app.use(cors());
app.use(express.json());

//Endpoints

app.get('/', (request, response) => {
  response.send('Welcome to the Palette Picker 🍭')
});

//GET ALL
app.get('/api/v1/projects', async (request, response) => {
  try {
    const allProjects = await database('projects').select();
    response.status(200).json(allProjects);
  } catch (error) {
    response.status(500).json({ error });
  }
});

app.get('/api/v1/palettes', async (request, response) => {
  try {
    const allPalettes = await database('palettes').select();
    response.status(200).json(allPalettes);
  } catch (error) {
    response.status(500).json({ error });
  }
});

//GET specific
app.get('/api/v1/projects/:id', async (request, response) => {
  const { id } = request.params;
  try {
    const project = await database('projects').where('id', id).select();
    if (project.length) {
      return response.status(200).json(project)
    }
    response.status(404).json({ error: '404: Specified project does not exist'});
  } catch {
    response.status(500).json({ error: '500: Internal Server Error'})
  }
});

app.get('/api/v1/palettes/:id', async (request, response) => {
  const { id } = request.params;
  try {
    const palette = await database('palettes').where('id', id).select();
    if (palette.length) {
      return response.status(200).json(palette)
    }
    response.status(404).json({ error: '404: Specified palette does not exist'});
  } catch {
    response.status(500).json({ error: '500: Internal Server Error'})
  }
});

//POST
app.post('/api/v1/projects', async (request, response) => {
  const newProject = request.body;
  for (let requiredParameter of ['name']) {
    if(!newProject[requiredParameter]) {
      return response.status(422).send({error: `Unexpected format, missing ${requiredParameter}`})
    }
  }
  try {
    const project = await database('projects').insert(newProject, 'id')
    response.status(201).json(project);
  } catch {
    response.status(500).json({error: '500: Internal Server Error'})
  }
});

app.post('/api/v1/palettes', async (request, response) => {
  const newPalette = request.body;
  for (let requiredParameter of ['name', 'color1', 'color2', 'color3', 'color4', 'color5']) {
    if (!newPalette[requiredParameter]) {
      return response.status(422).send({error: `Unexpected format, missing ${requiredParameter}`})
    }
  }
  try {
    const palette = await database('palettes').insert(newPalette, 'id')
    response.status(201).json(palette);
  } catch {
    response.status(500).json(error)
  }
});

//PATCH
app.patch('/api/v1/palettes/:id', async (request, response) => {
  const { id } = request.params;
  const newPatch = request.body;
  const palette = await database('palettes').where({id});
  if (!palette.length) {
    return response.status(422).send({error: `Palette with ${id} does not exist.`})
  }
  try {
    const patchedPalette = await database('palettes').where({id}).update(newPatch);
    response.status(200).json(`Patch with id of ${id} was successful.`);
  } catch {
    response.status(500).json(error)
  }
});

//DELETE
app.delete('/api/v1/projects/:id', async (request, response) => {
  const { id } = request.params;
  try {
    const project = await database('projects').where({id}).del();
    if (project.length > 0) {
      console.log(project)
      return response.status(200).json(`Project with an of ${id} successfully deleted.`)
    }
    response.status(404).json(`Project with id of ${id} not found.`)
  } catch(error) {
    response.status(500).json(error)
  }
})

app.delete('/api/v1/palettes/:id', async (request, response) => {
  const { id } = request.params;
  try {
    const palette = await database('palettes').where('id', id).del();
    if (!palette.length) {
      return response.status(200).json(`Project with id of ${id} successfully deleted.`)
    }
    response.status(404).json(`Project with an id of ${id} not found.`)
  } catch(error) {
    response.status(500).json(error)
  }
})

export default app;
