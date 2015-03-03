'use strict';

// using table for easier output
var Table = require('cli-table');
// using chalk for console coloring
var chalk = require('chalk');

/*
options.description
options.hideEmpty
options.aliases
options.cb
 */
var help = function help(gulp, options){
  if(!gulp) {
    throw new Error('You must pass the gulp instance to gulp help');
  }

  var oldTaskFunction = gulp.task;

  options = options || {};

  var description = options.description || 'Displays this help menu';
  var hideEmpty = options.hideEmpty || false;
  var aliases = options.aliases || [];
  aliases.unshift('default');
  var cb = options.cb || false;

  var newTaskFunction = function task() {
    var args = Array.prototype.slice.call(arguments);
    var fn = args.pop();
    var aliases = [];
    var name = '';
    var title = false;
    var opts = false;

    if(typeof fn !== 'function') {
      throw new Error('You must supply a function');
    }

    // see if we have opts (must be an object but not an array)
    var potentialOpts = args[args.length - 1];
    if(typeof potentialOpts === 'object' && !(potentialOpts instanceof Array)) {
      opts = args.pop();
    }

    // see if we have aliases
    if((args[args.length - 1]) instanceof Array) {
      aliases = args.pop();
    }

    if(args.length) {
      name = args.shift();
    } else {
      name = fn.name;
    }

    if(args.length) {
      title = args.shift();
    } else {
      title = false;
    }

    fn.description = title;
    if(opts) {
      fn.opts = opts;
    }

    if(!name) {
      throw new Error('Anonymous functions must have a task name');
    }

    oldTaskFunction.call(gulp, name, fn);

    aliases.forEach(function(alias) {
      oldTaskFunction.call(gulp, alias, fn);
    });
  };

  var gulpHelpTask = function helpTask(done) {
    var tasks = gulp.registry().tasks();
    var taskNames = Object.keys(tasks);
    taskNames = taskNames.sort(function(a, b) {
      return a.localeCompare(b);
    });

    console.log('Usage: gulp [task]');
    console.log('');
    console.log('Available Tasks');

    var table = new Table({
      chars: {
        'top': '',
        'top-mid': '',
        'top-left': '',
        'top-right': '',
        'bottom': '',
        'bottom-mid': '',
        'bottom-left': '',
        'bottom-right': '',
        'left': '',
        'left-mid': '',
        'mid': '',
        'mid-mid': '',
        'right': '',
        'right-mid': '',
        'middle': ' '
      }, style: {'padding-left': 2, 'padding-right': 2}
    });

    taskNames.forEach(function(taskName) {
      var task = gulp.get(taskName);
      var title = task.description;

      var margin = '';
      var additionalMargin = (taskName.match(/:/g) || []).length;
      var i = 0;
      while (i < additionalMargin) {
        margin += '  ';
        i++;
      }

      if(!title) {
        title = '';
      }

      if (title || !hideEmpty) {
        table.push([chalk.cyan(margin + taskName), title]);
      }

      margin += '  ';
      if(task.opts) {
        var opts = Object.keys(task.opts);
        opts.forEach(function(opt) {
          table.push([margin + opt, task.opts[opt]]);
        });
      }
    });

    console.log(table.toString());
    console.log('');

    if(cb) {
      cb(done);
    } else {
      done();
    }
  };

  gulp.task = newTaskFunction;

  // register the help task for help and it's aliases
  gulp.task('help', description, aliases, gulpHelpTask);
};

module.exports = help;

// command line options (show up in help description)
// colored output (cyan for text name)
