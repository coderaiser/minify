
const hasArg = (desiredArgs, args) => desiredArgs.some((desiredArg) => (args.hasOwnProperty(desiredArg) && args[desiredArg]));

module.exports = {
  hasArg
}
