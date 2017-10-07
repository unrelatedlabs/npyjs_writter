'use strict'

const npyjs_writter = require('./npyjs_writter')
const expect = require('chai').expect
var fs = require("fs");


describe('npyjs_writter', () => {
 
    it('should export a class', () => {
      expect(npyjs_writter.NPYJS_File).to.be.a('function')
    })

    it('create a new file', () => {
      var dtype = "[('timestamp', '<i4')]"

      var file = new npyjs_writter.MemoryFile()
      var fileWriter = new npyjs_writter.NPYJS_File(file, dtype)

      fileWriter.write( new Uint32Array([12]) );
      fileWriter.write( new Uint32Array([12]) );
      fileWriter.write( new Uint32Array([12]) );

      fileWriter.close()

      var b =  file.slice()
      //console.log(b,b.length)
	    var contents = fs.writeFileSync("./test.npy", new Buffer(b));

    })

  
})