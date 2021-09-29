const hasOwnProperty = (obj, property) => Object.prototype.hasOwnProperty.call(obj, property);

export const hasArg = (desiredArgs, args) => desiredArgs.some((desiredArg) => hasOwnProperty(args, desiredArg) && args[desiredArg]);

