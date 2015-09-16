var express = require('express');
var url = require('url'); //解析操作url
var superagent = require('superagent'); //这三个外部依赖不要忘记npm install
var cheerio = require('cheerio');
var eventproxy = require('eventproxy');

var storageUrls=[];
var count=2;
var ep = new eventproxy();
var baseUrl = "http://m.o.cn/gz/movie/news/150_10972_1.html";
var topicUrls=["http://www.sharejs.com/jquery/plugin/10027"];

+function getImgSrc(){
	//console.log("准备开始对"+topicUrls.length+"条记录进行搜索");
	ep.after('getALink', topicUrls.length, function(topics){
	    var topics = topics.map(function(topicPair){
	        var topicUrl = topicPair[0];
	        var topicHtml = topicPair[1];
	        if(topicHtml!==null){ 
		        //console.log("准备载入页面"+topicUrl);
		        
		        var $ = cheerio.load(topicHtml);

		        var texts=[];
		        $("*:contains('j')").map(function(idx,element){
		       		if(this.innerHTML){		       			
		       			texts.push(this.innerHTML);	       			
		       		}       	
		        });

		        //收藏列表
		        $('a').map(function(idx,element){
		        	if($(element).attr('href')){ 
		        		var href = url.resolve(topicUrl,$(element).attr('href'));
			        	if(!(href in storageUrls)){
			        		storageUrls.push(href);        		
			        	}
		        	}	        	
		        });	
		        //console.log("待处理地址"+storageUrls.length+"条");  
		        return ({
		        	href: topicUrl,
		            texts:texts
		        });
	        } 
	    });

	    //outcome
	    if("texts" in topics && topics.texts.length>0){ 
	    	console.log('outcome:');
	   		console.log(topics);
	    }
	    
		//更新工作队列
		if(count>0){ 
			topicUrls=storageUrls.splice(0,20);
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
	        	var res;
	            //console.log('fetch ' + topicUrl + ' successful');
	            if(res && "text" in res){ 
	            	ep.emit('getALink', [topicUrl, res.text]);
	        	}else{ 
	        		ep.emit('getALink', [topicUrl, null]);
	        	}
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