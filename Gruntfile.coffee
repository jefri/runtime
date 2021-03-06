module.exports = (grunt) ->
	grunt.initConfig
		pkg: grunt.file.readJSON 'package.json'
		meta:
			banner:
				'// <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> \n
				<%= pkg.homepage ? "// " + pkg.homepage + "\n" : "" %>
				// Copyright (c) 2012 - <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;
				Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>'

		clean:
			app:
				src: ["dist", "lib", "docs"]

		webpack:
			jefri:
				entry: './src/browser.js'
				output:
					filename: './lib/<%= pkg.name %>.js'
				resolve:
					extensions: ['', ".js", ".coffee"]
					packageAlias: 'browser',
				module:
					loaders: [
						{ test: /\.coffee$/, loader: 'coffee-loader' }
					]

		uglify:
			dist:
				src: [
					"lib/<%= pkg.name %>.js"
				]
				dest: "lib/<%= pkg.name %>.min.js"

		mochaTest:
			options:
				# timeout: 1e6
				reporter: 'spec'
				require:
					"test/helpers.js"
			runtime:
				src: ["test/spec/node/**/*.coffee"]

		karma:
			options:
				browsers: do ->
					# butt - Browser Under Test Tools
					butt = []
					unless process.env.DEBUG
						if process.env.BAMBOO
							butt.push 'PhantomJS'
						else if process.env.TRAVIS
							butt.push 'Firefox'
						else
							butt.push 'Chrome'
					butt
				frameworks: [ 'mocha', 'sinon-chai' ]
				reporters: [ 'spec', 'junit', 'coverage' ]
				singleRun: true,
				logLevel: 'INFO'
				preprocessors:
					'test/**/*.coffee': [ 'coffee' ]
				junitReporter:
					outputFile: 'build/reports/karma.xml'
				coverageReporter:
					type: 'lcov'
					dir: 'build/reports/coverage/'
			client:
				options:
					files: [
						'lib/jefri.js',
						'test/spec/karma/**/*.coffee'
					]
			min:
				options:
					files: [
						'lib/jefri.min.js',
						'test/spec/karma/**/*.coffee'
					]

		release: {}

	# These plugins provide necessary tasks.
	grunt.loadNpmTasks "grunt-mocha-test"
	grunt.loadNpmTasks "grunt-webpack"
	grunt.loadNpmTasks "grunt-contrib-watch"
	grunt.loadNpmTasks "grunt-contrib-uglify"
	grunt.loadNpmTasks "grunt-contrib-clean"
	grunt.loadNpmTasks "grunt-karma"
	grunt.loadNpmTasks "grunt-release"

	grunt.registerTask "connect", (grunt)->
		mount = require('st')({ path: __dirname + '/test/context', url: '/' })
		require('http').createServer (req, res)->
			res.setHeader 'Access-Control-Allow-Origin', '*'
			res.setHeader 'Access-Control-Allow-Credentials', true
			res.setHeader 'Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'
			res.setHeader 'Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS'
			if (mount(req, res))
				return
			else
				res.end('this is not a static file')
		.listen(8000)

	# Default task.
	grunt.registerTask "distribute", ["uglify:dist"]
	grunt.registerTask "build", ["webpack:jefri", "distribute"]
	grunt.registerTask "testNode", ["connect", "mochaTest:runtime"]
	grunt.registerTask "default", ["clean", "testNode", "build", "karma:client", "karma:min"]
