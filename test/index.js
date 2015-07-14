'use strict';

var gulp = require('gulp');
var gulpHelp = require('../index');
var test = require('unit.js');
var originalFn = gulp.task;
var spy = test.spy(gulp.task);
gulp.task = spy;

describe('gulp-help', function() {
  it('should register itself', function(done) {
    gulpHelp(gulp);

    test.should(spy.calledTwice).ok;

    test.should(spy.calledWith('help')).ok;
    test.should(spy.calledWith('default')).ok;
    done();
  });

  it('should be registered on the help task', function(done) {
    var tasks = gulp.registry().tasks();
    tasks.help.should.be.type('function');

    done();
  });

  it('should be registered on the default task', function(done) {
    var tasks = gulp.registry().tasks();
    tasks.default.should.be.type('function');

    done();
  });

  it('should have the correct description', function(done) {
    var helpTask = gulp.registry().get('help');

    helpTask.description.should.be.equal('Display this help text.');

    done();
  });

  it('should have a custom description if passed', function(done) {
    gulp.task = originalFn;
    spy = test.spy(gulp.task);
    gulp.task = spy;

    gulpHelp(gulp, {
      description: 'new description'
    });

    var helpTask = gulp.registry().get('help');

    helpTask.description.should.be.equal('new description');

    done();
  });

  it('should have aliases if passed in', function(done) {
    gulp.task = originalFn;
    spy = test.spy(gulp.task);
    gulp.task = spy;

    gulpHelp(gulp, {
      aliases: ['--help']
    });

    var aliasTask = gulp.registry().get('--help');
    aliasTask.should.be.type('function');
    done();
  });

  it('should call the print callback', function(done) {
    gulp.task = originalFn;
    spy = test.spy(gulp.task);
    gulp.task = spy;
    var printCallback = function() {
    };
    var printCallbackSpy = test.spy(printCallback);

    gulpHelp(gulp, {
      cb: printCallbackSpy
    });

    // stub console.log to prevent the extra output
    test.stub(console, "log");

    var helpTask = gulp.registry().get('help');
    helpTask();

    // restore console.log
    console.log.restore();

    test.should(printCallbackSpy.calledOnce).ok;
    done();
  });

  it('should hide methods with an empty description', function(done) {
    gulp.task = originalFn;
    spy = test.spy(gulp.task);
    gulp.task = spy;

    gulpHelp(gulp, {
      hideEmpty: true,
      cb: null
    });

    // add an empty task with no description to be sure that it is hidden

    // stub console.log to prevent the extra output
    var logStub = test.stub(console, "log");

    var helpTask = gulp.registry().get('help');
    helpTask(function() {
      var logStubCount = logStub.callCount;
      // restore console.log
      logStub.restore();
      var newLogStub = test.stub(console, "log");
      gulp.task('testing hide empty', function(){});

      helpTask(function() {
        newLogStub.restore();
        newLogStub.callCount.should.be.equal(logStubCount);
        done();
      });
    });
  });

  it('should throw when no arguments are passed in', function(done) {
    try {
      gulp.task();
      done(new Error('Didnt throw'));
    } catch (e) {
      done();
    }
  });

  it('should handle a function only', function(done) {
    var func = function onlyFunction(cb) {
      cb();
    };

    gulp.task(func);

    var registered = gulp.registry().get('onlyFunction');
    registered.should.be.equal(func);

    done();
  });

  it('should throw when only an anonymous function is passed', function(done) {
    try {
      gulp.task(function(){});
      done(new Error('Didnt throw when an anonymous function was passed in'));
    } catch(e) {
      done();
    }
  });

  it('should throw when no function is passed in', function(done) {
    try {
      gulp.task('noFunction');
      done(new Error('Didnt throw when no function was passed in'));
    } catch (e) {
      done();
    }
  });

  it('Should handle a name and function', function(done) {
    var nameFunction = function named() {};
    gulp.task('nameFunction', nameFunction);

    var fn = gulp.registry().get('nameFunction');
    fn.should.be.equal(nameFunction);

    done();
  });

  it('Should handle a name and anonymous function', function(done) {
    var nameFunction = function () {
    };
    gulp.task('nameAnonFunction', nameFunction);

    var fn = gulp.registry().get('nameAnonFunction');
    fn.should.be.equal(nameFunction);

    done();
  });

  it('Should handle a name, description, and function', function(done) {
    var func = function() {
    };
    gulp.task('nameDescFunction', 'description', func);

    var fn = gulp.registry().get('nameDescFunction');
    fn.should.be.equal(func);

    done();
  });

  it('Should handle a name, description, aliases, and function', function(done) {
    var func = function() {
    };
    gulp.task('nameDescAliasFunction', 'description', ['aliasFunc'], func);

    var fn = gulp.registry().get('nameDescAliasFunction');
    fn.should.be.equal(func);
    fn.description.should.be.equal('description');

    var fn2 = gulp.registry().get('aliasFunc');
    fn2.should.be.equal(func);
    fn2.description.should.be.equal('description');

    done();
  });

  it('Should handle a name, alias, and function', function(done) {
    var func = function() {
    };
    gulp.task('nameAliasFunction', ['aliasFunc2'], func);

    var fn = gulp.registry().get('nameAliasFunction');
    fn.should.be.equal(func);

    var fn2 = gulp.registry().get('aliasFunc2');
    fn2.should.be.equal(func);

    done();
  });

  it('Should handle an alias list and function only', function(done) {
    var func = function aliasFunc() {};
    gulp.task(['aliasFunc3'], func);

    var fn = gulp.registry().get('aliasFunc');
    fn.should.be.equal(func);

    var fn2 = gulp.registry().get('aliasFunc3');
    fn2.should.be.equal(func);

    done();
  });

  it('Should handle all parameters', function(done) {
    var fun = function(){};

    gulp.task('all', 'description', ['aliasFunc4'], {test: '--ok'}, fun);

    var fn = gulp.registry().get('all');
    fn.should.be.equal(fun);
    fn.description.should.be.equal('description');
    fn.opts.test.should.be.equal('--ok');

    var fn2 = gulp.registry().get('aliasFunc4');
    fn2.should.be.equal(fun);
    fn2.description.should.be.equal('description');
    fn.opts.test.should.be.equal('--ok');

    done();
  });

  it('Should handle a name, description, options, and function', function(done) {
    var fun = function() {
    };

    gulp.task('all', 'description', {test: '--ok'}, fun);

    var fn = gulp.registry().get('all');
    fn.should.be.equal(fun);
    fn.description.should.be.equal('description');
    fn.opts.test.should.be.equal('--ok');

    done();
  });

  it('should handle a name, alias, options, and function', function(done) {
    var fun = function() {
    };

    gulp.task('nameAliasOptsFunc', ['aliasFunc5'], {test: '--ok'}, fun);

    var fn = gulp.registry().get('nameAliasOptsFunc');
    fn.should.be.equal(fun);
    fn.opts.test.should.be.equal('--ok');

    var fn2 = gulp.registry().get('aliasFunc5');
    fn2.should.be.equal(fun);
    fn2.opts.test.should.be.equal('--ok');

    done();
  });

  it('should handle alias, options, and function', function(done) {
    var fun = function aliasOptFunc() {
    };

    gulp.task(['aliasFunc6'], {test: '--ok'}, fun);

    var fn = gulp.registry().get('aliasOptFunc');
    fn.should.be.equal(fun);
    fn.opts.test.should.be.equal('--ok');

    var fn2 = gulp.registry().get('aliasFunc6');
    fn2.should.be.equal(fun);
    fn2.opts.test.should.be.equal('--ok');

    done();
  });

  it('should handle options and function', function(done) {
    var fun = function optFunc() {
    };

    gulp.task({test: '--ok'}, fun);

    var fn = gulp.registry().get('optFunc');
    fn.should.be.equal(fun);
    fn.opts.test.should.be.equal('--ok');

    done();
  });

  it('should handle name, alias, options, and function', function(done) {
    var fun = function() {};

    gulp.task('nameAliasOptFunc', ['aliasFunc7'], {test: '--ok'}, fun);

    var fn = gulp.registry().get('nameAliasOptFunc');
    fn.should.be.equal(fun);
    fn.opts.test.should.be.equal('--ok');

    var fn2 = gulp.registry().get('aliasFunc7');
    fn2.should.be.equal(fun);
    fn2.opts.test.should.be.equal('--ok');

    done();
  });

  it('should handle name, options, and function', function(done) {
    var fun = function() {};

    gulp.task('nameOptFunc', {test: '--ok'}, fun);

    var fn = gulp.registry().get('nameOptFunc');
    fn.should.be.equal(fun);
    fn.opts.test.should.be.equal('--ok');
    done();
  });
});
