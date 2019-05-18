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

function deepFreeze(obj) {
  // Получаем имена свойств из объекта obj
  const propNames = Object.getOwnPropertyNames(obj);

  // Замораживаем свойства для заморозки самого объекта
  propNames.forEach((name) => {
    const prop = obj[name];

    // Заморозка свойства prop, если оно объект
    if (typeof prop === 'object' && prop !== null) deepFreeze(prop);
  });

  // Заморозить сам объект obj (ничего не произойдёт, если он уже заморожен)
  return Object.freeze(obj);
}

/**
 * Deep diff between two object, using lodash
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
function difference(object, base) {
  // eslint-disable-next-line
  function changes(object, base) {
    return _.transform(object, (result, value, key) => {
      if (!_.isEqual(value, base[key])) {
        // eslint-disable-next-line
        result[key] =
          _.isObject(value) && _.isObject(base[key]) ? changes(value, base[key]) : value;
      }
    });
  }
  return changes(object, base);
}

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
  },

  deepFreeze,
  difference
};
