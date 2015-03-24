(function(){
	var canvas;
	var ctx ;
	var CanvasMain  =window.CanvasMain ={
		width:null,
		height:null,
		prevX:0,
		prevY:0,
		currX:0,
		currY:0,
		pencilButton:0,
		eraserButton:0,
		inputElem:null,
		mouseMoveHandler:null,
		active:false,
		erase:false,
		init:function(){
			document.addEventListener('DOMContentLoaded',this.onLoad.bind(this));
		},
		onLoad:function(){
			canvas = document.getElementById('draw');
			ctx = canvas.getContext("2d");
			ctx.canvas.width  = window.innerWidth;
			ctx.canvas.height = window.innerHeight;
			this.width = canvas.width;
			this.height = canvas.height;
			
			window.addEventListener('resize',this.onResize.bind(this));
			this.pencilButton =document.getElementById("pencilButton");
			this.eraserButton =document.getElementById("eraserButton");
			this.inputElem = document.getElementById('chat-input');
			this.pencilButton.addEventListener('click',this.onPencilClick.bind(this));
			this.eraserButton.addEventListener('click',this.onEraserClick.bind(this));
			document.addEventListener('mousedown',this.onCanvasDown.bind(this));
			document.addEventListener('mouseup',this.onCanvasUp.bind(this));

			this.mouseMoveHandler = this.onMouseMove.bind(this);

			
		},
		checkStorage:function(){
			var data = localStorage.getItem("notes-canvas-"+Main.channelId);
			if(data){
				var img = new Image;
				img.onload = function(){
					CanvasMain.drawImage(img);
				};
				img.src = data;
			}
		},
		onPencilClick:function(event){
			this.erase=false;
			this.deselectEraser();
			if(this.pencilButton.classList.contains("active")){
				this.deselectPencil();
			}else{
				this.pencilButton.classList.add("active");
				this.inputElem.classList.add("noselect");
				this.inputElem.readOnly =true;
				this.active=true;

			}
		},
		deselectEraser:function(){
			this.eraserButton.classList.remove("active");
			this.active=false;
			this.inputElem.readOnly =false;
			this.inputElem.classList.remove("noselect");
		},
		deselectPencil:function(){
			this.pencilButton.classList.remove("active");
			this.active=false;
			this.inputElem.readOnly =false;
			this.inputElem.classList.remove("noselect");
		},
		onEraserClick:function(event){
			this.erase=true;
			this.deselectPencil();
			if(this.eraserButton.classList.contains("active")){
				this.deselectEraser();
			}else{
				this.eraserButton.classList.add("active");
				this.inputElem.classList.add("noselect");
				this.inputElem.readOnly =true;
				this.active=true;

			}
		},
		onCanvasUp:function(event){
			if(!this.active)return;
			document.removeEventListener('mousemove',this.mouseMoveHandler);
			var data =canvas.toDataURL();
			firebase && firebase.push({
				userID: Main.userId,
				type: "CANVAS",
				message:data
			});
			localStorage.setItem("notes-canvas-"+Main.channelId,data);
		},
		onCanvasDown:function(event){
			if(!this.active)return;
			this.currX = this.prevX = event.clientX - canvas.offsetLeft;
			this.currY  = this.prevY = event.clientY - canvas.offsetTop;
			document.addEventListener('mousemove',this.mouseMoveHandler);

		},
		onMouseMove:function(event){
			this.prevX = this.currX;
			this.prevY = this.currY;
			this.currX = event.clientX - canvas.offsetLeft;
			this.currY = event.clientY - canvas.offsetTop;
			if(this.erase){
				this.eraseDraw();
			}else{
				this.draw();
			}
		},
		draw:function() {
			ctx.beginPath();
			ctx.moveTo(this.prevX, this.prevY);
			ctx.lineTo(this.currX, this.currY);
			ctx.globalCompositeOperation = "destination-over";
			ctx.strokeStyle = "black";
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.closePath();
		},
		eraseDraw:function() {
			ctx.beginPath();
			ctx.moveTo(this.prevX, this.prevY);
			ctx.lineTo(this.currX, this.currY);
			ctx.globalCompositeOperation = "destination-out";
			ctx.strokeStyle = "rgba(0,0,0,1)";
			ctx.lineWidth = 20;
			ctx.stroke();
			ctx.closePath();
		},
		drawImage:function(img){
			ctx.globalCompositeOperation = "destination-over";
			ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
			ctx.drawImage(img,0,0);
			var data =canvas.toDataURL();
			localStorage.setItem("notes-canvas-"+Main.channelId,data);
		},
		onResize:function(){
			ctx.canvas.width  = window.innerWidth;
			ctx.canvas.height = window.innerHeight;
		}

	};

	CanvasMain.init();
})();