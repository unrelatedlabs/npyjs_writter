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
		console.log(this.length)
	}

	set(data,offset,length){
		this.buffer.set(data,offset,length || data.length);
	}

	writeString(str){
		  
		  this.write( stringToUint8(str) );
	}

	slice(){
		return this.buffer.slice(0,this.length)
	}
}

class NPYJS_File{
	// https://docs.scipy.org/doc/numpy-1.13.0/neps/npy-format.html
	constructor(file,dtype){
		this.file = file
		this.dtype = dtype
		this.size = 0;

		//MAGIC 
		file.write( new Uint8Array([0x93]))
		file.writeString( "NUMPY" );

		//version
		file.write( new Uint8Array([1,0]))

		//headerlen
		this.header_offset = 10;
		var header = stringToUint8(this.header(3))

		this.header_len = Math.ceil((header.length + 10)/ 16) * 16 - 10;//spec calls for padding. to 16byte alignment

		file.write( new Uint8Array([this.header_len & 0xFF,(this.header_len>>8) & 0xFF ]))
		for(var i = 0; i < this.header_len; i ++ ){
			file.writeString(" ")
		}



		//data
	}
	header(size){
		size = size || "placeholder_for_size"
		var header = "{" + "'descr': " + this.dtype + ", 'fortran_order': False, 'shape': (" +  size + ",), }"  
		return header;
	}
	
	open(dtype){

	}

	write(record){
		this.size += 1;
		this.file.write( new Uint8Array(record.buffer))
	}

	close(){
		this.file.set( stringToUint8(this.header(this.size)), this.header_offset );
	}
}

module.exports.NPYJS_File = NPYJS_File
module.exports.MemoryFile = MemoryFile