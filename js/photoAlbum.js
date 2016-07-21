var total=17;
var zWin=$(window);//用zepto取得window对象
var render=function(){
	var padding=2;
	var winWidth=zWin.width();//获得设备的宽度
	var picWidth=Math.floor((winWidth-3*padding)/4);//算出单张图片的宽度
	var tmpl='';//保存每一次for循环生成的html代码
	for(var i=1;i<=total;i++){
		var p=padding;
		var imgSrc='imgs/'+i+'.jpg';
		if(i%4==1){
			p=0;//设置每一行第一张图片的padding-left为0
		}
		tmpl+='<li data-id="'+i+'" class="animated bounceIn" style="width:'+picWidth+'px;height:'+picWidth+'px;padding-top:'+padding+'px;padding-left:'+p+'px;"><canvas id="can_'+i+'"></canvas></li>';
		var imageObj=new Image();//创建image对象
		imageObj.index=i;//给每个imageObj加一个自定义属性
		imageObj.onload=function(){
			var cvs=$('#can_'+this.index)[0].getContext('2d');//获得对应的canvas的绘图上下文
			cvs.width=this.width;
			cvs.height=this.height;
			cvs.drawImage(this,0,0);//将图片画到canvas上
		};
		imageObj.src=imgSrc;
	}
	$('#container').html(tmpl);
};
window.onload=render;
var largeImg=$('#large_img');//得到用于展示大图的img标签
var domImage=largeImg[0];//获得大图img标签的DOM引用(为了用原生js实现关于CSS3动画的事件，zepto中没有)
var loadImage=function(id,callback){
	// 展示大图的容器
	$('#large_container').css({
		width:zWin.width(),
		height:zWin.height()
	}).show();
	// 根据小图的id得到大图的src
	var largeImgSrc='imgs/'+id+'.large.jpg';
	// 因为要动态调整图片的宽高，所以需要img对象，用canvas触发硬件的自身加速
	var imgObj=new Image();
	imgObj.onload=function(){
		// 取得图片的真实宽高
		var w=this.width;
		var h=this.height;
		// 取得window的宽高
		var winWidth=zWin.width();
		var winHeight=zWin.height();
		var relw= winHeight*w/h;//得到图片的真实展示宽度
		var pLeft=parseInt((winWidth-relw)/2);
		var relh= winWidth*h/w;//得到图片的真实展示宽度
		var pTop=parseInt((winHeight-relh)/2);
		// 解决横图与纵图之间切换的bug
		largeImg.css({
			width:'auto',
			height:'auto',
			paddingLeft:0,
			paddingTop:0
		});
		// 通过计算图片的宽高比来确定当前图片是一张横图还是纵图
		//一般认为高度大于宽的的20%时认为是一张纵图
		if(h/w>1.2){
			//认为是一张纵图(高度占满整个屏幕)
			largeImg.attr('src',largeImgSrc).css({
				height:winHeight,//高度为整个屏幕的高度
				paddingLeft:pLeft
			});
		}else{
			//认为是一张横图(宽度占满整个屏幕)
			largeImg.attr('src',largeImgSrc).css('width',winWidth).css('padding-top',pTop);
		}
		callback&&callback();//当callback存在时才调用callback函数
	};
	imgObj.src=largeImgSrc;
}
var cid;//用于记录当前打开图片的id
//因为图片太多，所以此处用到了事件代理
$('#container').delegate('li','tap',function(){
	var _id=$(this).attr('data-id');//取得li的自定义属性
	cid=_id;
	loadImage(_id);//根据小图，加载相应的大图
	
});
//当点击大图时，大图层关闭
$('#large_container').tap(function(){
	$(this).hide();
}).swipeLeft(function(){
	cid++;
	if(cid>total){
		cid=total;
	}else{
		loadImage(cid,function(){
			domImage.addEventListener('webkitAnimationEnd',function(){
				largeImg.removeClass('animated bounceInRight');//动画结束后去掉class
				domImage.removeEventListener('webkitAnimationEnd',false);//动画结束后，此事件就不用再监听了
			},false);//采用这种方式添加事件，兼容性很好
			//这是一个回调函数
			largeImg.addClass('animated bounceInRight');//利用CSS框架做动画
		});
	}
}).swipeRight(function(){
	cid--;
	if(cid<1){
		cid=1;
	}else{
		loadImage(cid,function(){
			domImage.addEventListener('webkitAnimationEnd',function(){
				largeImg.removeClass('animated bounceInLeft');//动画结束后去掉class
				domImage.removeEventListener('webkitAnimationEnd',false);//动画结束后，此事件就不用再监听了
			},false);//采用这种方式添加事件，兼容性很好
			//这是一个回调函数
			largeImg.addClass('animated bounceInLeft');//利用CSS框架做动画
		});
	}
});