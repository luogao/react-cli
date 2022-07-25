const { TASK_STATUS } = require("../../../shared")

class Task {
  projectId = ''
  name = ''
  pid = -1
  port = 0
  id = -1
  status = TASK_STATUS.stop
  stdoutMessages = []


  constructor(config) {
    this.projectId = config.projectId
    this.name = config.name
    this.pid = config.pid
    this.port = config.port
    this.id = config.id
    this.status = config.status
  }

  onStdout = (msg) => {
    this.stdoutMessages.push(msg)
  }

  recoverMessage = () => {
    return this.stdoutMessages
  }
}


module.exports = {
  Task
}
