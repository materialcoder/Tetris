(function ($){
	var game = {
		rows: 20, //背景格行数
		cols: 10, //背景格列数
		size: 30, //每个小方块的大小
		timer: null, //自动下落定时器
		timer2: null, //底部固定方块延迟定时器
		index: 0, //暂停按钮指针
		shape: [ //所有可能的形状
			{
				type: [
					[0,0,1],
					[1,1,1],
					[0,0,0]
				],
				color: '#00ff00'
			},
			{
				type: [
					[1,0,0],
					[1,1,1],
					[0,0,0]
				],
				color: '#ff7f00'
			},
			{
				type: [
					[0,0,0],
					[0,1,1],
					[1,1,0],
					[0,0,0]
				],
				color: '#edff00'
			},
			{
				type: [
					[0,0,0],
					[1,1,0],
					[0,1,1],
					[0,0,0]
				],
				color: '#0024ff'
			},
			{
				type: [
					[0,1,0],
					[1,1,1],
					[0,0,0]
				],
				color: '#ffb600'
			},
			{
				type: [
					[1,1],
					[1,1]
				],
				color: '#ff00ff'
			},
			{
				type: [
					[0,0,0,0],
					[1,1,1,1],
					[0,0,0,0]
				],
				color: '#ff0000'
			}
		],
		//初始化函数
		init: function(){
			this.elements();
			this.createGrid();
			this.bind();
		},
		//获取需要的所有节点
		elements: function() {
			this.$grid = $("#grid"); //网格背景
			this.$play = $("#play"); //开始按钮
			this.$pause = $("#pause"); //暂停按钮
			this.$paused = $("#paused"); //暂停提示
			this.$block = $("#block"); //方块
			this.$nextShape = $("#nextShape"); //下一个方块
			this.$score = $("#score").find('p');
		},
		//绘制网格
		createGrid: function() {
			for(var i=0;i<this.rows*this.cols;i++) {
				var $li = $("<li>");
				$li.data('flag','on'); //是否可以放方块
				this.$grid.append($li);
			}
		},
		//绑定事件
		bind: function() {
			this.$play.on('click',$.proxy(this.play,this));
			$(document).on('keydown',$.proxy(this.dir,this));
			this.$pause.on('click',$.proxy(function(){
				if(this.index%2==0) {
					this.pause();
					this.$pause.html('Play');
					this.$paused.show();
				} else {
					this.playing();
					this.$pause.html('Pause');
					this.$paused.hide();
				}
				this.index++;
			},this));
		},
		//点击play后，将按钮隐藏，同时出现方块
		play:function() {
			this.$play.hide();
			this.showShape();
			this.playing();
		},
		//暂停
		pause: function(index) {
			clearInterval(this.timer);
		},
		//方块自动下降
		playing: function() {
			this.timer = setInterval($.proxy(function(){
				this.moveShapeDown(1);
			},this),500);
		},
		//显示方块
		showShape: function() {
			this.initShape();
			this.createShape();
			this.nextShape();
		},
		//初始化方快
		initShape: function() {
			this.nowShape = this.nextNowType || this.randomShape();
			this.typeShape = this.nowShape.type;
			this.colorShape = this.nowShape.color;
			this.xShape = 3;
			this.yShape =0;
		},
		//创建方块
		createShape: function(){
			this.$block.empty();
			for(var i=0;i<this.typeShape.length;i++) {
				for(var j=0;j<this.typeShape[i].length;j++) {
					if(this.typeShape[i][j] == 1) {
						var $div = $("<div>");
						$div.css('background',this.colorShape);
						$div.css('left',(j+this.xShape)*this.size);
						$div.css('top',(i+this.yShape)*this.size);
						$div.data('x',j+this.xShape);
						$div.data('y',i+this.yShape);
						this.$block.append($div);
					}
				}
			}
		},
		//提示下一个
		nextShape: function(){
			this.nextNowType = this.randomShape();
			this.nextTypeShape = this.nextNowType.type;
			this.nextColorShape = this.nextNowType.color;
			this.$nextShape.empty();
			for(var i=0;i<this.nextTypeShape.length;i++) {
				for(var j=0;j<this.nextTypeShape[i].length;j++) {
					if(this.nextTypeShape[i][j] == 1) {
						var $div = $("<div>");
						$div.css('background',this.nextColorShape);
						$div.css('left',j*this.size/2);
						$div.css('top',i*this.size/2);
						this.$nextShape.append($div);
					}
				}
			}
		},
		randomShape: function() {
			return this.shape[Math.floor(Math.random() * this.shape.length)];
		},
		dir:function(ev) { //方向的处理函数
			switch(ev.keyCode) {
				case 37:  //左
					this.moveShape(-1);
					break;
				case 38: //上
					this.typeShape = this.changeShape();
					this.createShape();
					break;
				case 39: //右
					this.moveShape(1);
					break;
				case 40: //下
					this.moveShapeDown(1);
					break;
			}
		},
		//方块变形
		changeShape: function() {
			var result = [];
			for(var i=0;i<this.typeShape.length;i++) {
				for(var j=0;j<this.typeShape[i].length;j++) {
					if(i==0) {
						result.push([]);
					}
					result[j][this.typeShape.length - 1 - i] = this.typeShape[i][j];
				}
			}
			if(this.isNotChangeable(result)) {
				return this.typeShape;
			} else {
				return result;
			}
		},
		//是否可以进行变形操作
		isNotChangeable: function(typeShape) {
			var $li = this.$grid.find('li');
			for(var i=0;i<typeShape.length;i++) {
				for(var j=0;j<typeShape[i].length;j++) {
					if(typeShape[i][j]==1){
						if((j+this.xShape <=-1) || (j+this.xShape >= this.cols) || (i+this.yShape >= this.rows)) { //左、右、下
							return true;
						}
						//如果变形后与已有方块重叠，就禁止变形
						if( $li.eq((i+this.yShape)*this.cols+(j+this.xShape)).data('flag')=='off' ) {
							return true;
						}
					}
				}
			}
			return false;
		},
		//左右移动方块
		moveShape:function(num) {
			var $div = this.$block.find("div");
			var that = this;
			if(this.isOut($div,num)) {
				return;
			}
			this.xShape += num;
			$div.each(function(i,item) {
				$(item).css('left',$(item).position().left + num*that.size);
				$(item).data('x',$(item).data('x')+num);
			});
		},
		//是否左右移动到边界
		isOut: function($div,num){
			var out = false;
			var $li = this.$grid.find('li');
			$div.each($.proxy(function(i,item) {
				if(($(item).position().left == 0 && num < 0) || ($(item).position().left == 270 && num > 0)) {
					out = true;
				}
				if($li.eq( $(item).data('y')*this.cols+$(item).data('x')+num ).data('flag')=='off') {
					out = true;
				}
			},this));
			return out;
		},
		//向下移动方块
		moveShapeDown: function(num) {
			var $div = this.$block.find('div');
			var that = this;
			if(this.isBottom($div,num)) {
				clearTimeout(this.timer2);
				this.timer2 = setTimeout($.proxy(function(){
					this.fixShape();
				},this),200);
				return;
			}
			this.yShape++;
			$div.each(function(i,item) {
				$(item).css('top',$(item).position().top + that.size);
				$(item).data('y',$(item).data('y') + 1);
			});
		},
		//是否到达底部
		isBottom: function($div,num) {
			var isBottom = false;
			var $li = this.$grid.find('li');
			$div.each($.proxy(function(i, item) {
				if($(item).position().top == 570) {
					isBottom = true;
				}
				//判断下落的方块下面一行是否已经存在方块，是的话就停止继续向下
				if($li.eq(($(item).data('y')+num)*this.cols+$(item).data('x')).data('flag') == 'off'){
					isBottom = true;
				}
			},this));
			return isBottom;
		},
		//固定方块的位置
		fixShape:function() {
			var $div = this.$block.find('div');
			var $li = this.$grid.find('li');
			$div.each($.proxy(function(i,item){
				$li.eq($(item).data('y')*(this.cols) + $(item).data('x')).css('opacity',1).data('flag','off');
			},this));
			this.gameOver();
			this.showShape();
			this.deleteRows();
		},
		//消除方块
		deleteRows: function() {
			var $li = this.$grid.find('li');
			var getPos = 0; 
			var count = 0; //要消除的行数
			for(var i=0;i<this.rows;i++) {
				bRow = true;
				for(var j=0;j<this.cols;j++){
					if($li.eq(i*this.cols+j).data('flag')=='on') {
						bRow = false;
					}
				}
				if(bRow) {
					getPos = i*this.cols;
					count++;
					for(var m=0;m<this.cols;m++) {
						$li.eq(i*this.cols+m).css('opacity',0).data('flag','on');
					}
					for(var n=getPos;n>0;n--) {
						if($li.eq(n).data('flag')=='off'){
							$li.eq(n).css('opacity',0).data('flag','on');
							$li.eq(n+this.cols).css('opacity',1).data('flag','off');
						}
					}
					i = 0;
					j = 0;
				}
			}
			/*console.log(count,getPos);
			for(var i=getPos;i>0;i--) {
				if($li.eq(i).data('flag')=='off'){
					$li.eq(i).css('opacity',0).data('flag','on');
					$li.eq(i+count*this.cols).css('opacity',1).data('flag','off');
				}
			}*/
			this.countScore(count);
		},
		//统计分数
		countScore: function(count) {
			var score = parseInt(this.$score.html());
			if(count==1) {
				score += 50;
			} else if(count==2) {
				score += 100;
			} else if(count==3) {
				score += 200;
			} else if(count==4) {
				score += 300;
			}
			this.$score.html(score);

			clearInterval(this.timer);
			var speed = 500 - Math.floor(score/2000)*50;
			this.timer = setInterval($.proxy(function(){
				this.moveShapeDown(1);
			},this),speed);
		},
		//游戏结束
		gameOver: function() {
			if(this.yShape==0) {
				clearInterval(this.timer);
				alert('Game Over!');
			}
		}
	}
	game.init();
})(jQuery);