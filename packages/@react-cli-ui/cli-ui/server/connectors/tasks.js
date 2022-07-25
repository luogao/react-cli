const StaticMethods = require('./utils');
const portfinder = require('portfinder');
const { v4: uuid } = require('uuid');
const path = require('path');
const { notify } = require('../util/notification');
const { runScripts } = require('../util/scripts');
const { TASK_STATUS } = require('../../shared');
const { TaskStore } = require('../models/TaskStore');

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
    this.initRunningTask(); // 初始化的时候通知客户端，当前运行的任务
  }

  noticeCurrenRunningTasks() {
    this.client.emit('currentRunningTasksUpdate', {
      data: this.currentRunningTasks,
    });
  }

  initRunningTask() {
    console.log('🥳初始化的时候通知客户端，当前运行的任务');
    this.noticeCurrenRunningTasks();
  }

  getCurrentRunningTasks() {
    this.noticeCurrenRunningTasks();
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


  recoverTaskMessage = (id) => {
    const task = TaskStore.getTask(id)
    let message = []
    if (task) {
      console.log(task)
      message = task.recoverMessage()
    }
    this.client.emit('currentTaskMessageRecover', { data: { msg: message, taskId: task.id } })
  }


  async run(id = null, taskName) {
    const activeProjectId = this.getActiveProjectId();
    console.log(activeProjectId)
    const activeProject = this.getActiveProject();

    const filePath = this.getActiveProjectFilePath();
    const taskDetail = activeProject.tasks.find((task) => task.id === id);
    console.log({ taskDetail });
    console.log({ filePath });
    const taskPort = await portfinder.getPortPromise();
    const command = taskName === 'start' ? `${ taskName } --port=${ taskPort }` : taskName;
    console.log({ command, taskPort });
    const subprocess = runScripts(command, filePath);
    const pid = subprocess.pid;

    const currentTask = TaskStore.addTask({
      projectId: activeProjectId,
      taskName,
      pid,
      taskPort,
      id,
      status: TASK_STATUS.running,
    })



    this.db
      .get('tasks')
      .push({
        projectId: activeProjectId,
        taskName,
        pid,
        taskPort,
        id,
        status: TASK_STATUS.running,
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
        currentTask.onStdout({
          type: 'stdout',
          text: queue,
          id: taskDetail.id,
        })
      });

      subprocess.stdout.on('data', (buffer) => {
        const message = buffer.toString()
        outPipe.add(message);
      });

      notify({
        title: 'Script run',
        message: `Script ${ taskName } successfully`,
        icon: 'done',
      });
      // this.client.emit('taskStartSuccess', {
      //   taskPort,
      //   taskName,
      //   pid,
      // });
      this.client.emit('currentRunningTasksUpdate', { data: this.currentRunningTasks });
    } catch (error) {
      console.log({ error });
      this.client.emit('error', {
        title: 'Failure',
        message: `script run ${ taskName } error`,
      });
    }
  }

  stop(id = null, pid) {
    console.log({ id, pid });
    const task = this.db.get('tasks').find({ id }).value();
    require('child_process').exec(`kill -9 ${ pid }`, (err) => {
      if (err) {
        console.log('err', err);
        notify({
          title: '脚本停止失败',
          message: `停止 ${ task.name } 脚本失败 `,
          icon: 'done',
        });
      } else {
        this.db.get('tasks').remove({ id }).write();
        this.noticeCurrenRunningTasks();
        notify({
          title: 'Script stop',
          message: `已停止运行脚本 ${ task.name } `,
          icon: 'done',
        });
      }
    });
  }
}

module.exports = TaskApi;
