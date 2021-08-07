const StaticMethods = require('./utils');
const portfinder = require('portfinder');
const { v4: uuid } = require('uuid');
const path = require('path');
const { notify } = require('../util/notification');
const { runScripts } = require('../util/scripts');

const MAX_LOGS = 2000;
const tasks = new Map();

function logPipe(action) {
  const maxTime = 300;

  let queue = '';
  let size = 0;
  let time = Date.now();
  let timeout;

  const add = (string) => {
    queue += string;
    size++;

    if (size === 50 || Date.now() > time + maxTime) {
      flush();
    } else {
      clearTimeout(timeout);
      timeout = setTimeout(flush, maxTime);
    }
  };

  const flush = () => {
    clearTimeout(timeout);
    if (!size) return;
    action(queue);
    queue = '';
    size = 0;
    time = Date.now();
  };

  return {
    add,
    flush,
  };
}

function findOne(id) {
  for (const [, list] of tasks) {
    const result = list.find((t) => t.id === id);
    if (result) return result;
  }
}

function addLog(log, client) {
  // const task = findOne(log.taskId);
  // if (task) {
  // if (task.logs.length === MAX_LOGS) {
  //   task.logs.shift();
  // }
  // task.logs.push(log);
  // console.log(log);
  client.emit('taskLogAdd', { data: log });
  // }
}

// function getTasks (file = null) {
//   if (!file) file = cwd.get()
//   let list = tasks.get(file)
//   if (!list) {
//     list = []
//     tasks.set(file, list)
//   }
//   return list
// }

class TaskApi extends StaticMethods {
  constructor(client, db, logs) {
    super(db);
    this.client = client;
    this.db = db;
    this.tasks = [];
    this.childProcess = {};
    this.logs = logs;
  }

  list() {
    this.tasks = this.updateAndGetProjectTaskList();
    if (this.tasks.length > 0) {
      const filePath = this.getActiveProjectFilePath();
      tasks.set(filePath, this.tasks);
    }
    this.client.emit('tasks', {
      data: this.tasks,
    });
  }

  async run(id = null, name) {
    const activeProjectId = this.db.get('config.lastOpenProject').value();
    const activeProject = this.db.get('projects').find({ id: activeProjectId }).value();

    const filePath = `/${activeProject.path.join('/')}`;
    const taskDetail = tasks.get(filePath).find((task) => task.id === id);
    console.log({ taskDetail });
    console.log({ activeProject });
    console.log({ filePath });
    const port = await portfinder.getPortPromise();
    const command = name.includes('start') ? `${name} --port=${port}` : name;
    const subprocess = runScripts(command, filePath);

    // this.db.set('tasks', []).write();
    this.db
      .get('tasks')
      .push({
        projectId: activeProjectId,
        taskName: name,
        pid: subprocess.pid.toString(),
        taskPort: port,
        id,
      })
      .write();

    try {
      const outPipe = logPipe((queue) => {
        addLog(
          {
            type: 'stdout',
            text: queue,
            id: taskDetail.id,
          },
          this.client,
        );
      });

      subprocess.stdout.on('data', (buffer) => {
        outPipe.add(buffer.toString());
      });

      notify({
        title: 'Script run',
        message: `Script ${name} successfully`,
        icon: 'done',
      });
      this.client.emit('taskStartSuccess', {
        taskPort,
        taskName,
        pid,
      });
    } catch (error) {
      console.log({ error });
      this.client.emit('erro', {
        title: 'Failure',
        message: `script run ${name} error`,
      });
    }
  }

  stop(id = null) {
    const activeProjectId = id !== null ? id : this.db.get('config.lastOpenProject').value();
    const child = this.db.get('tasks').find({ projectId: activeProjectId }).value();
    require('child_process').exec(`kill -9 ${child.pid}`, (err) => {
      if (err) {
        console.log('err', err);
      } else {
        notify({
          title: 'Script stop',
          message: `Script ${child.pid} successfully`,
          icon: 'done',
        });
      }
    });
  }
}

module.exports = TaskApi;
