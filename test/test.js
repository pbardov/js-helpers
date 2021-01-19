/* global describe, it */
/* eslint-disable no-await-in-loop, max-classes-per-file */
const process = require('process');

process.env.DEBUG = true;

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const assert = require('assert');

chai.use(chaiAsPromised);

const { getObjectMethodNames } = require('../index');

describe('Javascript helper functions test', () => {
  it('getObjectMethodNames test', () => {
    class A {
      reply() {
        return 'A';
      }
    }

    class B extends A {
      replyB() {
        return 'B';
      }
    }

    class C extends B {
      replyC() {
        return 'C';
      }

      reply() {
        return `${super.reply()}C`;
      }
    }

    const c = new C();
    const methods = [...getObjectMethodNames(c)];
    assert(methods.indexOf('reply') >= 0, 'reply must be exists');
    assert(methods.indexOf('replyB') >= 0, 'replyB must be exists');
    assert(methods.indexOf('replyC') >= 0, 'replyC must be exists');
  });

  // TODO: write tests to other helper functions
});
