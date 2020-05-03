'use strict';

const start = require('./common');

const assert = require('assert');
const co = require('co');
const util = require('./util');

const mongoose = start.mongoose;
const Schema = mongoose.Schema;

describe('Nested arrays', function() {

  this.timeout(5000);

  let db;

  before(function() {
    db = start();
  });

  after(function(done) {
    db.close(done);
  });

  beforeEach(() => db.deleteModel(/.*/));
  afterEach(() => util.clearTestData(db));
  afterEach(() => util.stopRemainingOps(db));

  it('Works as expected', function() {
    const SubchildSchema = new Schema({ title: String });

    const ChildSchema = new Schema({
      subchilds: [[SubchildSchema]]
    });

    const ParentModel = db.model(
      'Parent',
      { children: [ChildSchema] }
    );

    return co(function* () {
      const { _id } = yield ParentModel.create({
        children: [
          {
            subchilds: [
              [{}]
            ]
          }
        ]
      });

      const parent = yield ParentModel.findById(_id);

      parent.children[0].subchilds[0][0].title = 'hello world';

      const saved = yield parent.save();

      assert.strictEqual(saved.children[0].subchilds[0][0].title, 'hello world');
    });

  });
});
