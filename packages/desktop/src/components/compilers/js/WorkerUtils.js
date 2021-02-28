// @flow

type Handler = (message: any) => any;
type WorkerEventData = {
  error: ?string,
  message: ?any,
  uid: string,
};
type WorkerEvent = {
  data: WorkerEventData,
};

const DEBUG = false

let MAX_ERROR = 30

const selfPostMessage = (...args) => {
  DEBUG && console.log('POSTING MESSAGE FROM [WORKER]', ...args)
  return self.postMessage(...args)
}
const workerPostMessage = (worker, ...args) => {
  DEBUG && console.log('POSTING MESSAGE FROM [HOST]', ...args)
  return worker.postMessage(...args)
}

export function registerPromiseWorker(handler: Handler) {
  self.addEventListener("message", function(event) {
    const { data } = event;
    DEBUG && console.log('MESSAGE RECEIVED IN [WORKER]', data)

    if (!data || !data.message) return;

    try {
      const message = handler(data.message);
      console.log('result of handler:', message)
      selfPostMessage({
        message,
        uid: data.uid,
      });
    } catch (error) {
      if (MAX_ERROR) {
        --MAX_ERROR
        selfPostMessage({
          error: error.message,
          uid: data.uid,
        });
      }
    }
  });
}

export function registerPromiseWorkerApi(worker: any, settings: Record<string, any>) {
  const { staticPath } = settings
  const uidMap = {};

  // Unique id per message since message order isn't guaranteed
  let counter = 0;

  worker.addEventListener("message", (event: WorkerEvent) => {
    const { uid, error, message } = event.data;
    const [resolve, reject] = uidMap[uid];

    DEBUG && console.log('MESSAGE RECEIVED IN [HOST]')

    delete uidMap[uid];

    if (error == null) {
      resolve(message);
    } else {
      reject(error);
    }
  });

  return {
    postMessage(message: any) {
      const uid = ++counter;

      DEBUG && console.log('POSTING MESSAGE:', message)

      return new Promise<any>((resolve, reject) => {
        uidMap[uid] = [resolve, reject];
        workerPostMessage(worker, {
          message,
          uid,
        });
      });
    },
  };
}


function ensureFirstBackSlash(str: string) {
  return str.length > 0 && str.charAt(0) !== '/'
    ? '/' + str
    : str;
}

function uriFromPath(_path: string) {
  const pathName = resolvePath(_path).replace(/\\/g, '/');
  return encodeURI('file://' + ensureFirstBackSlash(pathName));
}

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
var SLASH = 47;
var DOT = 46;
var getCWD;
if (typeof process !== "undefined" && typeof process.cwd !== "undefined") {
    getCWD = process.cwd;
}
else {
    getCWD = function () {
        var pathname = '';
        return pathname.slice(0, pathname.lastIndexOf("/") + 1);
    };
}
/**
 * Resolves . and .. elements in a path with directory names
 * @param {string} path
 * @param {boolean} allowAboveRoot
 * @return {string}
 */
function normalizeStringPosix(path, allowAboveRoot) {
    var res = '';
    var lastSlash = -1;
    var dots = 0;
    var code = void 0;
    var isAboveRoot = false;
    for (var i = 0; i <= path.length; ++i) {
        if (i < path.length) {
            code = path.charCodeAt(i);
        }
        else if (code === SLASH) {
            break;
        }
        else {
            code = SLASH;
        }
        if (code === SLASH) {
            if (lastSlash === i - 1 || dots === 1) {
                // NOOP
            }
            else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || !isAboveRoot ||
                    res.charCodeAt(res.length - 1) !== DOT ||
                    res.charCodeAt(res.length - 2) !== DOT) {
                    if (res.length > 2) {
                        var start = res.length - 1;
                        var j = start;
                        for (; j >= 0; --j) {
                            if (res.charCodeAt(j) === SLASH) {
                                break;
                            }
                        }
                        if (j !== start) {
                            res = (j === -1) ? '' : res.slice(0, j);
                            lastSlash = i;
                            dots = 0;
                            isAboveRoot = false;
                            continue;
                        }
                    }
                    else if (res.length === 2 || res.length === 1) {
                        res = '';
                        lastSlash = i;
                        dots = 0;
                        isAboveRoot = false;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) {
                        res += '/..';
                    }
                    else {
                        res = '..';
                    }
                    isAboveRoot = true;
                }
            }
            else {
                var slice = path.slice(lastSlash + 1, i);
                if (res.length > 0) {
                    res += '/' + slice;
                }
                else {
                    res = slice;
                }
                isAboveRoot = false;
            }
            lastSlash = i;
            dots = 0;
        }
        else if (code === DOT && dots !== -1) {
            ++dots;
        }
        else {
            dots = -1;
        }
    }
    return res;
}
/**
 * https://nodejs.org/api/path.html#path_path_resolve_paths
 * @param {...string} paths A sequence of paths or path segments.
 * @return {string}
 */
function resolvePath() {
    var paths = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        paths[_i] = arguments[_i];
    }
    var resolvedPath = "";
    var resolvedAbsolute = false;
    var cwd = void 0;
    for (var i = paths.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        var path = void 0;
        if (i >= 0) {
            path = paths[i];
        }
        else {
            if (cwd === void 0) {
                cwd = getCWD();
            }
            path = cwd;
        }
        // Skip empty entries
        if (path.length === 0) {
            continue;
        }
        resolvedPath = path + "/" + resolvedPath;
        resolvedAbsolute = path.charCodeAt(0) === SLASH;
    }
    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)
    // Normalize the path (removes leading slash)
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);
    if (resolvedAbsolute) {
        return "/" + resolvedPath;
    }
    else if (resolvedPath.length > 0) {
        return resolvedPath;
    }
    else {
        return '.';
    }
}
