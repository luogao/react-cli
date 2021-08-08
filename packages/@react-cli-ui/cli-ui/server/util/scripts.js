const execa = require('execa');

// npm scripts
function runScripts(command, pathProject) {
  console.log({ command, pathProject });
  return execa.command(`yarn ${command}`, {
    shell: true,
    cwd: pathProject,
    stdio: ['inherit', 'pipe', 'pipe'],
  });
}

// run console comand
function runConsoleComand(comand) {
  return execa.command(comand, { shell: true, stdio: ['inherit', 'pipe', 'pipe'] });
}

module.exports = {
  runScripts,
  runConsoleComand,
};
