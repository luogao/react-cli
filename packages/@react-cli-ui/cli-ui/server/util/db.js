const path = require('path');
const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const chalk = require('chalk');

const dbPath = path.resolve(__dirname, '../../db.json');
const adapter = new FileAsync(dbPath, {
  defaultValue: {
    projects: [],
    foldersFavorite: [],
    tasks: [],
    config: {
      hardDrive: '',
    },
    logs: [],
  },
});
const db = low(adapter)
  .then((_db) => {
    console.log(chalk.hex('#009688')('🧙‍♂️启动的时候把tasks 清除'));
    _db.set('tasks', []).write(); // 启动的时候把tasks 清除
    return _db;
  })

module.exports = {
  db,
  dbPath,
};
