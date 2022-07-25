const { db: dbAsync, dbPath } = require('../util/db');
const FolderApi = require('./folders');
const FileApi = require('./file');
const ProjectApi = require('./projects');
const LogsApi = require('./logs');
const DependenciesApi = require('./dependencies');
const TaskApi = require('./tasks');
const KillApi = require('./kill');

class Api {
  constructor() {
    this.init = this.init.bind(this);
    this.onMessage = this.onMessage.bind(this);
  }

  async init(client) {
    this.client = client;
    const db = await dbAsync;
    this.logs = new LogsApi(client, db);
    this.folder = new FolderApi(client, db, this.logs);
    this.files = new FileApi(client, db, this.logs);
    this.project = new ProjectApi(client, db, this.folder, this.logs);
    this.dependencies = new DependenciesApi(client, db, this.folder, this.logs);
    this.tasks = new TaskApi(client, db, this.logs);
    this.kill = new KillApi(client, db, this.logs);
  }

  onMessage(message) {
    const {
      type,
      name,
      url,
      id,
      hidden,
      path,
      manager,
      preset,
      log,
      file,
      dep,
      port,
      runningTaskPid,
      taskId
    } = message;
    switch (type) {
      // Folders
      case 'CHANGE_HARD_DRIVE':
        this.folder.setHardDrive(name);
        break;

      case 'GET_FOLDERS':
        this.folder.getFolders(url, hidden);
        break;

      case 'CREATE_FOLDER':
        this.folder.createFolder(url);
        break;

      // Kill port
      case 'KILL_PORT':
        this.kill.port(port);
        break;

      // File
      case 'OPEN_EDIT_FILE':
        this.files.openInEditor(path);
        break;

      // Favorite folder
      case 'SET_FAVORITE':
        this.folder.setFavorite(file);
        break;

      // Last open project
      case 'GET_LAST_OPEN_PROJECT':
        this.folder.getLastOpenProject();
        break;

      case 'LIST_FAVORITE':
        this.folder.listFavorite();
        break;

      // Projects
      case 'OPEN_PROJECT':
        this.project.open(id);
        break;

      case 'GET_PROJECTS':
        this.project.getProjects(dbPath);
        break;

      case 'CREATE_PROJECT':
        this.project.createProject(name, path, manager, preset);
        break;

      case 'IMPORT_PROJECT':
        this.project.importProject(path);
        break;

      case 'GET_PROJECT_BY_ID':
        this.project.getProjectById(id);
        break;

      case 'DELETE_PROJECT_BY_ID':
        this.project.deleteProjectById(id);
        break;

      case 'ADD_FAVORITE_BY_ID':
        this.project.addFavoriteProjectById(id);
        break;

      case 'OPEN_LAST_PROJECT':
        this.project.autoOpenLastProject();
        break;

      case 'CLEAR_DB':
        this.project.clearDb();
        break;

      case 'REFRESH_PROJECT':
        this.project.refresh();
        break;

      // Dependencies
      case 'GET_LIST_DEPENDINCIES':
        this.dependencies.list(path);
        break;

      case 'INSTALL_DEPENDINCIES':
        this.dependencies.install(name, dep);
        break;

      case 'UNINSTALL_DEPENDINCIES':
        this.dependencies.uninstall(name);
        break;

      // Tasks
      case 'GET_LIST_TASKS':
        this.tasks.list();
        break;

      case 'RUN_TASK':
        this.tasks.run(id, name);
        break;

      case 'STOP_TASK':
        this.tasks.stop(id, runningTaskPid);
        break;

      case 'GET_CURRENT_RUNNING_TASKS':
        this.tasks.getCurrentRunningTasks();
        break;

      case 'recoverTaskMessage':
        this.tasks.recoverTaskMessage(taskId)

      // Config
      case 'GET_CONFIG':
        this.project.getConfig();
        break;

      // Logs
      case 'GET_LOGS':
        this.logs.list();
        break;

      case 'ADD_LOGS':
        this.logs.add(log);
        break;

      case 'GET_LAST_LOG':
        this.logs.last();
        break;

      case 'CLEAR_LOG':
        this.logs.clear();
        break;
    }
  }
}

// // WS api
// function api(message, client) {
//   dbAsync.then((db) => {
//     const logs = new LogsApi(client, db);
//     const folder = new FolderApi(client, db, logs);
//     const files = new FileApi(client, db, logs);
//     const project = new ProjectApi(client, db, folder, logs);
//     const dependencies = new DependenciesApi(client, db, folder, logs);
//     const tasks = new TaskApi(client, db, logs);
//     const kill = new KillApi(client, db, logs);
//   });
// }

module.exports = Api;
