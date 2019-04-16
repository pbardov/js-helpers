/* eslint-disable no-multi-assign */
const _ = require('lodash');

const depthOf = (val, start = 0) => {
  let level = start;

  _.each(val, (v) => {
    if (typeof v === 'object') {
      const depth = depthOf(v, level + 1);
      level = Math.max(depth, level);
    }
  });

  return level;
};

module.exports = {
  bindProto(that, proto) {
    const nproto = {};
    _.each(proto, (func, name) => {
      nproto[name] = func.bind(that);
    });
    return nproto;
  },

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  asyncCall(fn, ...args) {
    return new Promise((resolve, reject) => {
      let fnRes;
      const cb = (err, ...result) => {
        if (err) {
          reject(err);
        } else {
          resolve([fnRes, ...result]);
        }
      };

      const margs = [...args, cb];
      fnRes = fn(...margs);
    });
  },

  toPlainObject(obj) {
    let res;
    if (obj.toJSON && typeof obj.toJSON === 'function') {
      res = _.assign({}, obj.toJSON());
    } else {
      res = _.assign({}, obj);
    }
    return res;
  },

  depthOf,

  treeFromFlat(flat) {
    const digitRe = /^(\d+)$/;
    const result = {};
    _.each(flat, (v, k) => {
      const paths = `${k}`.split('.');
      let node = result;
      let nodeName = 'tree';
      let n = 0;
      do {
        const newNodeName = paths[n];
        const newNodeType = newNodeName.search(digitRe) >= 0 ? 'array' : 'object';
        let newNode;

        if (node instanceof Array) {
          if (nodeName.search(digitRe) >= 0) {
            const ai = parseInt(nodeName, 0);
            if (node.length <= ai) {
              node.length = ai + 1;
            }
            newNode = node[ai] = node[ai] || (newNodeType === 'array' ? [] : {});
          } else {
            // wrong parent
            return;
          }
        } else {
          newNode = node[nodeName] = node[nodeName] || (newNodeType === 'array' ? [] : {});
        }

        node = newNode;
        nodeName = paths[n];

        n += 1;
      } while (n <= paths.length - 1);

      const prop = paths[paths.length - 1];
      if (node instanceof Array) {
        if (prop.search(digitRe) >= 0) {
          const ai = parseInt(prop, 0);
          if (node.length <= ai) {
            node.length = ai + 1;
          }

          node[ai] = v;
        } else {
          // wrong parent
        }
      } else {
        node[prop] = v;
      }
    });

    return result.tree;
  }
};
