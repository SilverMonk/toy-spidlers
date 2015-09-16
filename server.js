var express = require('express');
var url = require('url'); //解析操作url
var superagent = require('superagent'); //这三个外部依赖不要忘记npm install
var cheerio = require('cheerio');
var eventproxy = require('eventproxy');

var storageUrls=[];
var count=2;
var ep = new eventproxy();
var baseUrl = "http://m.o.cn/gz/movie/news/150_10972_1.html";
var topicUrls=[baseUrl];

+function getImgSrc(){
	console.log("准备开始对"+topicUrls.length+"条记录进行搜索");
	ep.after('getALink', topicUrls.length, function(topics){
	    var topics = topics.map(function(topicPair){
	        var topicUrl = topicPair[0];
	        var topicHtml = topicPair[1];
	        var $ = cheerio.load(topicHtml);

	        var imgs=[];
	        $('img').map(function(idx,element){
	        	imgs.push($(this).attr('src'));
	        });

	        //收藏列表
	        $('a').map(function(idx,element){
	        	var href=$(this).attr('href');
	        	if(!(href in storageUrls)){ 
	        		storageUrls.push($(this).attr('href'));
	        	}else{ 
	        		console.log("重复地址"+$(this).attr('href'));
	        	}
	        });	
	        console.log("待处理地址"+storageUrls.length+"条");  
	        return ({
	        	href: topicUrl,
	            imgs:imgs
	        });
	    });

	    //outcome
	    console.log('outcome:');
	    console.log(topics);
		//更新工作队列
		if(count>0){ 
			topicUrls=storageUrls.splice(0,2);
			count=count-1;
			//再次启动
		    if(topicUrls.length>0){
		    	getImgSrc();
		    }
		}
	});
	//第三步：确定放出事件消息的

	topicUrls.forEach(function (topicUrl) {
	    superagent.get(topicUrl)
	        .end(function (err, res) {
	            console.log('fetch ' + topicUrl + ' successful');
	            ep.emit('getALink', [topicUrl, res.text]);
	        });
	});
}();


var fs= require('fs'); 
var path = require('path');
function writeLog(){ 
	fs.writeFile(path.join(__dirname, 'account.js'), JSON.stringify(tempAccount), function (err) {
	    if (err) throw err;
	    console.log("Export Account Success!");
	});
}