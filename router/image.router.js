const express = require('express')
const router = express.Router()
const fs = require('fs')
const formidable = require('formidable');

router.post('/image/upload', function (req, res) {
	var form = new formidable.IncomingForm();
	form.encoding = 'utf-8';
	form.uploadDir = '/home/images',
	form.keepExtensions = true;
	form.maxFieldsSize = 2 * 1024 * 1024;

	form.parse(req, function (err, fields, files) {
		if (err) {
			console.log(err)
			res.send(err)
		} if (files.file) {
			console.log(files)
			var filename = files.file.name;
			var nameArray = filename.split('.');
			var type = nameArray[nameArray.length - 1];
			var name = '';
			for (var i = 0; i < nameArray.length; i++) {
				name = name + nameArray[i]
			}
			var date = new Date();
			var time = '_' + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDay() + "_" + date.getHours() + "_" + date.getMinutes();
			var avatarName = name + time + '.' + type;
			var newPath = form.uploadDir + '/' + avatarName;
			fs.renameSync(files.file.path, newPath)
			res.send({data: '/images/' + avatarName})
		} else {
			res.send(new Error('文件上传为空'))
		}
	})
})

router.post('/upload/base64', function(req, res){
	//接收前台POST过来的base64 
	var imgData = req.body.imgData; 
	//过滤data:URL 
	var base64Data = imgData.replace(/^data:image\/\w+;base64,/, ""); 
	var dataBuffer = new Buffer(base64Data, 'base64'); 
	var name = 'baseurl' + new Date().getTime() + '.png'
	var path = '/home/images/' + name
	fs.writeFile(path, dataBuffer, function(err) { 
		if(err){ 
			res.send(err); 
		} else {
			res.send({data: '/images/' + name}); 
		}
	});
});

module.exports = router