module.exports = (grunt) ->

	coffees = (cwd, dest)->
		expand: true
		cwd: cwd
		src: "*.coffee"
		dest: dest
		ext: ".js"

	grunt.initConfig
		pkg: grunt.file.readJSON 'package.json'
		meta:
			banner: '
			// <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> \n
			<%= pkg.homepage ? "// " + pkg.homepage + "\n" : "" %>
			// Copyright (c) 2012 - <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;
			Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>'

		clean:
			app:
				src: ["dist", "lib", "docs"]

		coffee:
			app:
				files:
					"dist/compiled/EventDispatcher.js": "src/EventDispatcher.coffee"
					"dist/compiled/Runtime.js": "src/Runtime.coffee"
					"dist/compiled/Transaction.js": "src/Transaction.coffee"
					"dist/compiled/request.js": "src/min/request.coffee"

				options:
					bare: true
					util: true
			nunit:
				files: [
					coffees "test/nunit/", "test/nunit/built/" 
				]

			jasmine:
				files: [
					coffees "test/spec/node/coffee/", "test/spec/node/spec/"
				]

			qunit:
				files: [
					coffees "test/qunit/min/coffee/", "test/qunit/min/coffee/compiled"
				]
				options:
					bare: true
		concat:
			node:
				src: [
					"<banner:meta.banner>"
					"src/node/pre.js"
					"dist/compiled/Runtime.js"
					"dist/compiled/Transaction.js"
					"dist/compiled/EventDispatcher.js"
					"src/node/post.js"
				]
				dest: "lib/<%= pkg.name %>.js"

			min:
				src: [
					"<banner:meta.banner>"
					"dist/compiled/request.js"
					"src/min/pre.js"
					"dist/compiled/Runtime.js"
					"dist/compiled/Transaction.js"
					"dist/compiled/EventDispatcher.js"
					"src/min/post.js"
				]
				dest: "dist/<%= pkg.name %>.min.js"

		uglify:
			dist:
				src: [
					"<banner:meta.banner>"
					"dist/<%= pkg.name %>.min.js"
				]
				dest: "lib/<%= pkg.name %>.min.js"

		nodeunit:
			files: ["test/nunit/built/*js"]

		connect:
			testing:
				root: '.'
				port: 8000

		jasmine_node:
			projectRoot: "test/spec/node"
			specFolderName: "spec"
			match: ""
			matchall: true

		qunit:
			min:
				options:
					urls: ["http://localhost:8000/test/qunit/min/qunit.html"]

		watch:
			app:
				files: [
					"src/EventDispatcher.coffee"
					"src/Runtime.coffee"
					"src/Transaction.coffee"
					"src/min/request.coffee"
				]
				tasks: ["default"]

			tests:
				files: [
					"test/nunit/*coffee"
					"test/spec/node/coffee/*coffee"
					"test/qunit/min/coffee/*coffee"
				]
				tasks: ["test"]

	
	# These plugins provide necessary tasks.
	grunt.loadNpmTasks "grunt-jasmine-node"
	grunt.loadNpmTasks "grunt-contrib-watch"
	grunt.loadNpmTasks "grunt-contrib-qunit"
	grunt.loadNpmTasks "grunt-contrib-nodeunit"
	grunt.loadNpmTasks "grunt-contrib-uglify"
	grunt.loadNpmTasks "grunt-contrib-coffee"
	grunt.loadNpmTasks "grunt-contrib-connect"
	grunt.loadNpmTasks "grunt-contrib-concat"
	grunt.loadNpmTasks "grunt-contrib-clean"

	# Default task.
	grunt.registerTask "build", ["coffee:app", "concat:node", "concat:min", "uglify:dist"]
	grunt.registerTask "test_nunit", ["coffee:nunit", "nodeunit"]
	grunt.registerTask "test_jasmine", ["coffee:jasmine", "jasmine_node"]
	grunt.registerTask "test_qunit", ["coffee:qunit", "qunit:min"]
	grunt.registerTask "test", ["connect:testing", "test_nunit", "test_jasmine", "test_qunit"]
	grunt.registerTask "default", ["clean", "build", "test"]
