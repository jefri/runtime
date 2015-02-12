var JEFRi = require('./jefri');
JEFRi.Runtime = require('./runtime');
JEFRi.Transaction = require('./transaction');

module.exports = JEFRi;

if(typeof window !== 'undefined' && window !== null){
	window.JEFRi = module.exports
}
