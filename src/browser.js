var JEFRi = require('./jefri');
JEFRi.Runtime = require('./Runtime');
JEFRi.Transaction = require('./transaction');

module.exports = JEFRi;

if(typeof window !== 'undefined' && window !== null){
	window.JEFRi = module.exports;
}
