const app = require('./app');
const knex = require('knex');

const { PORT, DB_URL} = require('./config');

app.listen(PORT, () => {

  const db = knex({
    client: 'pg',
    connection: DB_URL,
  });
  app.set('db', db);

  console.log(`Server listening at http://localhost:${PORT}`);
});