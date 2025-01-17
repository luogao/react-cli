const fs = require('fs');
const path = require('path');

const { craNpm, craYarn } = require('../util/create');
const { v4: uuid } = require('uuid');

const StaticMethods = require('./utils');

class ProjectApi extends StaticMethods {
  constructor(client, db, folder, logs) {
    super(db);
    this.client = client;
    this.db = db;
    this.folder = folder;
    this.logs = logs;
  }

  /**
   * Open project
   * @param {number} id Number string
   */
  open(id) {
    if (id) {
      // Date
      this.db
        .get('projects')
        .find({ id })
        .assign({
          openDate: Date.now(),
        })
        .write();

      this.db.set('config.lastOpenProject', id).write();

      this.client.emit('lastOpenProject', {
        data: this.db.get('projects').find({ id }),
      });
    }
  }

  /**
   * Get config
   */
  getConfig() {
    this.client.emit('config', {
      data: this.db.get('config').value(),
    });
  }

  /**
   * Get list project
   */
  getProjects(folderDbPath) {
    if (fs.existsSync(folderDbPath)) {
      this.db
        .get('projects')
        .value()
        .forEach((project) => {
          console.log(project);
          if (!fs.existsSync(path.join('/'))) {
            this.db.get('projects').remove({ id: project.id }).write();
            if (this.db.get('config.lastOpenProject').value() === project.id) {
              this.db.set('config', {}).write();
            }
          }
        });
      this.client.emit('projects', {
        data: this.db.get('projects').value(),
      });
    } else {
      this.client.emit('error', {
        message: '出了点问题，请重试',
      });
    }
  }

  /**
   * Create new project
   * @param {string} name Name new project
   * @param {array} pathProject Path new project
   * @param {string} manager Manager new project (npm/yarn)
   * @param {string} preset Preset new project (create-react-app/other...)
   */
  createProject(name, pathProject, manager, preset) {
    fs.readdir(path.join('/', ...pathProject, name), async (err, files) => {
      if (err) {
        let subprocess;
        if (manager === 'npm') {
          subprocess = craNpm(pathProject, name);
        } else {
          subprocess = craYarn(pathProject, name);
        }

        try {
          subprocess.stdout.pipe(process.stdout);

          subprocess.stdout.on('data', (data) => {
            const message = data.toString('utf8');
            message !== '\n' &&
              this.client.emit('logging', {
                message: message.replace(/(\\n|\[36m|\[m|\[39m|\[32m)/gim, () => ''),
              });
          });

          const { stdout } = await subprocess;

          // add db project
          if (stdout) {
            const id = uuid();
            this.db.set('config.lastOpenProject', id).write();
            this.db
              .get('projects')
              .push({
                id,
                name,
                path: [...pathProject, name],
                manager,
                preset,
                favorite: false,
                type: 'react',
                openDate: Date.now(),
              })
              .write()
              .then(() => {
                this.client.emit('notification', {
                  title: 'Success',
                  message: `Project ${name} successfully create`,
                });
                this.logs.add({
                  message: `Project ${name} successfully create`,
                  type: 'info',
                });
              });
          }
        } catch (error) {
          this.client.emit('error', {
            title: 'Failure',
            message: `Project ${name} create error`,
            error,
          });
          this.logs.add({
            message: `Project ${name} create error`,
            type: 'info',
          });
        }
      }

      if (files) {
        this.client.emit('error', {
          title: 'Ошибка создания проекта',
          message: `Директория ${name} - уже существует`,
        });
        this.logs.add({
          message: 'Ошибка создания проекта',
          type: 'info',
        });
      }
    });
  }

  /**
   * Get project by Id
   * @param {number} id ID project
   */
  getProjectById(id) {
    this.client.emit('project', {
      data: this.db.get('projects').filter({ id }).value(),
    });
  }

  /**
   * Delete project by Id
   * @param {number} id ID project
   */
  deleteProjectById(id) {
    if (id) {
      this.db.get('projects').remove({ id }).write();
      this.client.emit('projects', {
        data: this.db.get('projects').value(),
      });
    } else {
      this.client.emit('projects', {
        data: this.db.get('projects').value(),
      });
    }
  }

  /**
   * Add Favorite project by id
   * @param {number} id ID project
   */
  addFavoriteProjectById(id) {
    const pr = this.db.get('projects').find({ id }).value();
    if (pr.favorite) {
      this.db.get('projects').find({ id }).assign({ favorite: false }).write();
    } else {
      this.db.get('projects').find({ id }).assign({ favorite: true }).write();
    }
    this.client.emit('projects', {
      data: this.db.get('projects').value(),
    });
  }

  /**
   * Clear db
   */
  clearDb() {
    this.db.get('projects').remove().write();
    this.client.emit('projects', {
      data: this.db.get('projects').value(),
    });
  }

  refresh() {
    const filePath = this.getActiveProjectFilePath();
    const isNodeModulesExist = fs.existsSync(path.join(filePath, 'node_modules'));
    console.log(isNodeModulesExist);
    const packageData = this.folder.readPackage(path.join(filePath));
    this.db
      .get('projects')
      .find({ id: this.getActiveProjectId() })
      .assign({ isAvailable: isNodeModulesExist })
      .write();
    this.client.emit('projectRefreshSuccess');
    this.client.emit('notification', {
      message: '当前项目信息已更新',
    });
  }

  /**
   * Import Project
   */
  importProject(pathProject) {
    const pathProjectUrl = `/${pathProject.join('/')}`;
    if (!fs.existsSync(path.join(pathProjectUrl, 'package.json'))) {
      this.client.emit('error-import-project', {
        title: '没有找到package.json',
        message: '此项目没有package.json，无法导入',
      });
    } else {
      const isNodeModulesExist = fs.existsSync(path.join(pathProjectUrl, 'node_modules'));
      const project = {
        id: uuid(),
        path: pathProject,
        favorite: false,
        type: this.checkFramework(pathProjectUrl).type,
        isAvailable: isNodeModulesExist,
      };
      project.name = path.parse(pathProjectUrl).name;
      this.db.get('projects').push(project).write();
      this.open(project.id);
      this.client.emit('notification', {
        message: 'Import successfully project',
      });
      this.client.emit('projects', {
        data: this.db.get('projects').value(),
      });
    }
  }

  /**
   *  Open last project
   */
  autoOpenLastProject() {
    const id = this.db.get('config.lastOpenProject').value();
    if (id) {
      open(id);
    }
  }
}

module.exports = ProjectApi;
