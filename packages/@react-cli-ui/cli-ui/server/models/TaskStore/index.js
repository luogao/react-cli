const { Task } = require("./Task")

class TaskStore {
  tasks = []
  constructor() {

  }



  addTask = (config) => {
    const newTask = new Task(config)
    this.tasks.push(newTask)
    return newTask
  }

  stopTask = (id) => {
    this.tasks = this.tasks.filter(t => t.id !== id)
  }

  getTask = (id) => {
    return this.tasks.find(t => t.id === id) || null
  }

  /**
   *
   * @param {number} projectId
   */
  getCurrentProjectTasks = (projectId) => {
    return this.tasks.filter(t => t.projectId === projectId)
  }
}


module.exports = {
  TaskStore: new TaskStore()
}
