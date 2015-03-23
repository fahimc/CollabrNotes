(function(){
	var firebase;
	var Main=window.Main ={
		channelId:null,
		userId:null,
		inputElem:null,
		newButton:null,
		mailButton:null,
		init:function(){
			document.addEventListener('DOMContentLoaded',this.onLoad.bind(this));
		},
		onLoad:function(){
			this.setChannel();
			this.setup();
			this.setListeners();
			this.checkStorage();
			setTimeout(this.onOpen.bind(this), 1);
		},
		setChannel:function(){
			this.channelId = location.hash.replace('#', '')||  (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
			location.hash  = this.channelId;
		},
		checkStorage:function(){
			var data = localStorage.getItem("notes-"+this.channelId);
			this.inputElem.value =data;
			CanvasMain.checkStorage();
		},
		setup:function(){
			window.firebase = firebase = new Firebase('https://webrtc.firebaseIO.com/' + this.channelId);
			this.userId = Math.random().toString(36).substr(2, 35).toUpperCase();
			this.inputElem = document.getElementById('chat-input');
			this.newButton = document.getElementById('newButton');
			this.mailButton = document.getElementById('mailButton');
			this.clipButton = document.getElementById('clipButton');
		},
		setListeners:function(){
			firebase.on("child_added", function(data) {
				Main.onMessage(data.val());
			});
			firebase.onDisconnect().remove();
			this.inputElem.addEventListener("keyup",this.onKepUp.bind(this));
			this.newButton.addEventListener("click",this.newNote.bind(this));
			this.mailButton.addEventListener("click",this.mailClicked.bind(this));
			//this.clipButton.addEventListener("click",this.clipboardClicked.bind(this));
		},
		save:function(){
			localStorage.setItem("notes-"+this.channelId,this.inputElem.value);
			
		},
		onKepUp:function(event){
			firebase && firebase.push({
				userID: this.userId,
				type: "MESSAGE",
				message:this.inputElem.value
			});
			this.save();
		},
		onMessage:function(data) {
			switch (data.type) {
				case "JOINED":
				firebase && firebase.push({
					userID: data.userID,
					type: 'INIT',
					message:this.inputElem.value
				});
				break;
				case "INIT":
				if(data.userID == this.userId)
				{
					this.inputElem.value = data.message;
				}
				break;
				case "MESSAGE":
				if (data.userID != this.userId && data.message) {
					this.inputElem.value = data.message;
				}
				break;
				case "CANVAS":
				if (data.userID != this.userId && data.message) {
					var img = new Image;
					img.onload = function(){
						CanvasMain.drawImage(img);
					};
					img.src = data.message;
				}
				break;
			}
		},
		onOpen:function(data) {
			firebase && firebase.push({
				userID: this.userId,
				type: 'JOINED'
			});
		},
		newNote:function(){
			var url = window.location.href.split("#")[0];
			window.open(url,"_blank");
		},
		clipboardClicked:function(){
			var input = document.createElement("input");
			input.type="text";
			input.value = document.URL;
			var textRange = input.createTextRange();
			textRange.execCommand("RemoveFormat");
			textRange.execCommand("Copy");
		},
		mailClicked:function(){
			var subject = "Notes";
			var body = this.inputElem.value.replace(/\n/g,'%0D%0A');
			var mailto_link = 'mailto:' + '' + '?subject=' + subject + '&body=' + body;

			win = window.open(mailto_link, 'emailWindow');
		}
	};

	Main.init();
})();