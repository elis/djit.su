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

const DEBUG = true

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
  console.log('REGISTERING PROMISE [WORKER]', { handler, self, process })
  self.addEventListener("message", function(event) {
    const { data } = event;
    DEBUG && console.log('MESSAGE RECEIVED IN [WORKER]', data, { process })

    if (!data || !data.message) return;

    try {
      const message = handler(data.message);

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

export function registerPromiseWorkerApi(worker: any) {
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
