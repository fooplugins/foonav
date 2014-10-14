'use strict';

module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			files: ['dist']
		},
		uglify: {
			prod: {
				options: {
					preserveComments: 'some',
					mangle: {
						except: [ "undefined" ]
					}
				},
				files: {
					'dist/foonav.min.js': [
						"src/js/foonav.js"
					]
				}
			}
		},
		cssmin: {
			minify: {
				files: {
					'dist/foonav.min.css': [
						"src/css/foonav.css",
						"src/css/foonav.icons.css",
						"src/css/themes/foonav.blue.css",
						"src/css/themes/foonav.dark.css",
						"src/css/themes/foonav.green.css",
						"src/css/themes/foonav.light.css",
						"src/css/themes/flat-ui/foonav.flat-ui.amethyst.css",
						"src/css/themes/flat-ui/foonav.flat-ui.asbestos.css",
						"src/css/themes/flat-ui/foonav.flat-ui.asphalt.css",
						"src/css/themes/flat-ui/foonav.flat-ui.blue.css",
						"src/css/themes/flat-ui/foonav.flat-ui.emerald.css",
						"src/css/themes/flat-ui/foonav.flat-ui.orange.css",
						"src/css/themes/flat-ui/foonav.flat-ui.pumpkin.css",
						"src/css/themes/flat-ui/foonav.flat-ui.red.css",
						"src/css/themes/flat-ui/foonav.flat-ui.silver.css",
						"src/css/themes/flat-ui/foonav.flat-ui.turquoise.css"
					]
				}
			}
		},
		copy: {
			font: {
				files: [
					{ src: 'src/css/fonts/foonav.eot', dest: 'dist/fonts/foonav.eot' },
					{ src: 'src/css/fonts/foonav.svg', dest: 'dist/fonts/foonav.svg' },
					{ src: 'src/css/fonts/foonav.ttf', dest: 'dist/fonts/foonav.ttf' },
					{ src: 'src/css/fonts/foonav.woff', dest: 'dist/fonts/foonav.woff' }
				]
			}
		}
	});

	// Load grunt tasks
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.registerTask('default', ['clean', 'uglify', 'cssmin', 'copy']);
};
