var Promise = require("bluebird");


function stringToUint8(str){
	var result = [];
  for (var i = 0; i < str.length; i++) {
    result.push(str.charCodeAt(i));
  }
  return ( new Uint8Array(result) );
}

class MemoryFile{
	constructor(capacity){
		this.buffer = new Uint8Array( capacity || 128*1024 )
		this.length = 0
		this.pos = 0;
	}

	write(data){
		if( this.buffer.length <= this.length + data.length ){
			var newBuffer = new Uint8Array( this.buffer.length * 1.5 )
			newBuffer.set(this.buffer)
			this.buffer = newBuffer
		}

		this.buffer.set(data,this.length)
		this.length += data.length
	}

	set(data,offset,length){
		return new Promise((resolve)=>{	
			this.buffer.set(data,offset,length || data.length);
			resolve();
		})
	}

	get blob(){
		return new Blob([this.buffer.slice(0,this.length)],{type : 'application/octet-stream'}) 
	}
}

class NPYJS_File{
	// https://docs.scipy.org/doc/numpy-1.13.0/neps/npy-format.html
	/**
	 * 
	 * @param {*} file output file
	 * @param {*} dtype nump dtype descr of a record
	 * @param {*} dsize size of a record
	 */
	constructor(file,dtype,dsize){
		this.file = file
		this.dtype = dtype
		this.dsize = dsize
		this.count = 0;
		this.size = 0
	}
	
	header(size){
		size = size || "placeholder_for_size"
		var header = "{" + "'descr': " + this.dtype + ", 'fortran_order': False, 'shape': (" +  size + ",), }"  
		return header;
	}
	
	writeHeader(){
		//headerlen
		this.header_offset = 10;
		var header = stringToUint8(this.header())
		this.header_len = Math.ceil((header.length + 10)/ 64) * 64 - 10;//spec calls for padding. to 16byte alignment

		var dummyHeader = ""
		for(var i = 0; i < this.header_len; i ++ ){
			dummyHeader += " "
		}
				
		//MAGIC
		var file = this.file 
		file.write( new Uint8Array([0x93]))
		file.write( stringToUint8("NUMPY") ) 
		file.write( new Uint8Array([1,0])) 
		file.write( new Uint8Array([this.header_len & 0xFF,(this.header_len>>8) & 0xFF ]))
		file.write( stringToUint8(dummyHeader) )
	}

	write(record){
		this.count += 1;
		this.size += record.length

		if( this.count == 1 ){
			this.writeHeader()
			this.file.write( new Uint8Array(record.buffer)) 
		}else{
			this.file.write( new Uint8Array(record.buffer))
		}
	}

	close(){
		if( this.size % this.dsize != 0){
			throw "Total size does not divide into the record size"
		}
		return this.file.set( stringToUint8(this.header(this.size/this.dsize)), this.header_offset );
	}
}

module.exports.NPYJS_File = NPYJS_File
module.exports.MemoryFile = MemoryFile