/module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './backend/data/inventory.db'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './backend/src/migrations'
    },
    seeds: {
      directory: './backend/src/seeds'
    }
  }
};
