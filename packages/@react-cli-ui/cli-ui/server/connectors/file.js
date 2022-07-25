const StaticMethods = require('./utils')
const launch = require('launch-editor')

class FileApi extends StaticMethods {
  constructor (client, db, logs) {
    super(db)
    this.client = client
    this.db = db
    this.logs = logs
  }

  /**
   * Open in editor propject
   * @param {string} path Path folder project
   */
  async openInEditor (path) {
    const currentPath = `/${path.join('/')}`
    launch(
      currentPath,
      process.env.EDITOR || 'code',
      (fileName, errorMsg) => {
        console.error(`Unable to open '${fileName}'`, errorMsg)
        this.client.emit('error', {
          title: '文件系统错误',
          message: errorMsg
        })
        this.logs.add({
          message: '文件系统错误',
          type: 'info'
        })
      })
  }
}

module.exports = FileApi
