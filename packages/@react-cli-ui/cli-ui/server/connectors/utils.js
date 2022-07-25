const fs = require('fs-extra');
const path = require('path');
var os = require('os');
const { get } = require('lodash');
const { v4: uuid } = require('uuid');
const { runConsoleComand } = require('../util/scripts');

class StaticMethods {
  constructor(db) {
    this.db = db;
    this.drives = [];
  }

  get hardDrive() {
    return this.db.get('config.hardDrive', '').value();
  }

  get currentRunningTasks() {
    return this.db.get('tasks').value()
  }

  /**
   * 创建文件夹信息对象
   * @param {string} pathFolder - запрашиваемый путь
   * @param {string} namefolder - название директории
   */
  checkFramework(pathFolder, namefolder = '') {
    const folderItem = { name: namefolder };
    const packageJson = path.join(pathFolder, namefolder, 'package.json');
    const exist = fs.existsSync(packageJson);
    if (exist) {
      const packageJsonFile = fs.readFileSync(packageJson, 'utf8');
      const packageJsonObj = JSON.parse(packageJsonFile);
      if (get(packageJsonObj, 'dependencies.react-native')) {
        folderItem.type = 'react-native';
      } else if (get(packageJsonObj, 'dependencies.vue')) {
        folderItem.type = 'vue';
      } else {
        folderItem.type = 'unknown';
      }
    } else {
      folderItem.type = 'empty';
    }
    return folderItem;
  }

  isPackage(file) {
    try {
      return fs.existsSync(path.join(file, 'package.json'));
    } catch (e) {
      console.warn(e.message);
    }
    return false;
  }

  readPackage(file) {
    const pkgFile = path.join(file, 'package.json');
    if (fs.existsSync(pkgFile)) {
      const pkg = fs.readJsonSync(pkgFile);
      return pkg;
    }
  }

  /**
   * Формирование информационного объекта папки
   * @param {string} file
   */
  generateFolder(file) {
    return {
      name: path.basename(file),
      path: file,
    };
  }

  isReactProject(file) {
    if (!this.isPackage(file)) return false;
    try {
      const pkg = this.readPackage(file);
      return Object.keys(pkg.devDependencies || {}).includes('react');
    } catch (e) {
      if (process.env.DEV_SERVER) {
        console.log(e);
      }
    }
    return false;
  }

  isFavorite(file) {
    return !!this.db.get('foldersFavorite').find({ id: file }).size().value();
  }

  async getHardDriveList() {
    if (this.drives.length) return this.drives;
    let subprocess;

    if (os.platform() === 'win32') {
      subprocess = await runConsoleComand('fsutil fsinfo drives');
      this.drives = subprocess.stdout
        .toString('utf8')
        .match(/[A-Z]:/g)
        .map((drive) => `${ drive }/`);
    }

    if (!this.hardDrive) {
      this.db.set('config.hardDrive', this.drives[0]).write();
    }

    return this.drives;
  }

  getActiveProjectId() {
    return this.db.get('config.lastOpenProject').value() || '';
  }

  getActiveProject() {
    const activeProjectId = this.getActiveProjectId();
    if (!activeProjectId) return null;
    const activeProject = this.db.get('projects').find({ id: activeProjectId }).value();
    return activeProject;
  }

  getActiveProjectFilePath() {
    const activeProject = this.getActiveProject();
    const filePath = activeProject ? `/${ activeProject.path.join('/') }` : '';
    return filePath;
  }

  updateAndGetProjectTaskList() {
    let tasks = [];
    const activeProject = this.getActiveProject();
    if (!activeProject) return tasks;

    const filePath = this.getActiveProjectFilePath();
    const pkg = this.readPackage(path.join(filePath));
    if (pkg.scripts) {
      let existTasks = [];
      const scriptsKeys = Object.keys(pkg.scripts);
      try {
        existTasks = this.db.get('projects').find({ id: activeProject.id }).get('tasks').value();
      } catch (err) { }

      for (let index = 0; index < scriptsKeys.length; index++) {
        const key = scriptsKeys[index];
        const exist = existTasks && existTasks.length > 0 && existTasks.find((t) => t.name === key);
        if (exist) {
          tasks.push(exist);
        } else {
          tasks.push({
            id: uuid(),
            name: key,
            command: pkg.scripts[key],
            path: filePath,
            projectId: activeProject.id,
          });
        }
      }
    }

    this.db.get('projects').find({ id: activeProject.id }).assign({ tasks: tasks }).write();
    return tasks;
  }
}

module.exports = StaticMethods;
