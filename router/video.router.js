const express = require('express')
const router = express.Router()
const fs = require('fs')
const formidable = require('formidable');

router.post('/video/upload', function (req, res) {
	var code = req.query.code
	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8';
	form.uploadDir = '/home/videos/' + code.split('.')[0]
	form.keepExtensions = true;
	form.maxFieldsSize = 2 * 1024 * 1024;

	form.on('error', function(err) {
		console.log(err)
	});

	function mkdir(path) {
		return new Promise((resolve, reject) => {
			fs.exists(path, function (exists) {
				if (!exists) {
					fs.mkdir(path, function () {
						resolve()
					})
				} else {
					resolve()
				}
			})
		})
	}

	mkdir(form.uploadDir).then(() => {
		form.parse(req, function (err, fields, files) {
			if (err) {
				console.log(err)
				res.send(err)
			} if (files.file) {
				var newPath = form.uploadDir + '/' + fields.index;
				fs.renameSync(files.file.path, newPath)
				if (fields.islast == 'true') {
					fs.readdir(form.uploadDir, function (err, data) {
						var count = 0, bufs = [];
						data.sort(function (x, y) {
							return x - y
						}).forEach( function(filename, i) {
							fs.readFile(form.uploadDir + '/' + filename, function (err, filebuf) {
								count++
								bufs[i] = filebuf
								if (count == data.length) {
									var buf = Buffer.concat(bufs)
									const wstream = fs.createWriteStream('/home/videos/' + fields.name);   
									wstream.on('open', () => {   
										const blockSize = 1024;   
										console.log(buf.length)
										const nbBlocks = Math.ceil(buf.length / blockSize);   
										for (let i = 0; i < nbBlocks; i += 1) {    
											const currentBlock = buf.slice(     
												blockSize * i,     
												Math.min(blockSize * (i + 1), buf.length)  
											);    
											wstream.write(currentBlock);
										}
										wstream.end();
									});
									wstream.on('error', (err) => {
										console.log(err)
										res.send(err)
									});
									wstream.on('finish', () => {
										data.forEach(function(filename){
										    var curPath = form.uploadDir + "/" + filename;
										    fs.unlinkSync(curPath);
										});
										fs.rmdirSync(form.uploadDir);
										res.send('上传成功')
									}); 
								}
							})
							return
						});
					})
				} else {
					res.send({data: newPath})
				}
			} else {
				res.send('文件上传为空')
			}
		})
	})
})

module.exports = router