jQuery.fn.extend({
	audio: function() {
		audios=this.find('audio');
		if(audios.length!=1) return; //throw {desc: "Not one audio in sound", audio: audios, sound: this};
		return audios[0];
	}
});

selection=$("<sound></sound>");
function select(sound){
	$('input').focus();
	selection.attr('selected', false);
	selection=sound;
	selection.attr('selected', "selected");
	refreshInfo();
}

function play(sound){
	sound.audio().play();
}
function replay(sound){
	sound.audio().currentTime=0;
	play(sound);
}
function rewind(sound){
	sound.audio().currentTime=0;
}
function seek(sound, amount){
	sound.audio().currentTime+=amount;
}
function playpause(sound){
	if (sound.audio().paused) sound.audio().play();
	else sound.audio().pause();
}
function loop(sound){ // sets loop
	if (!sound.audio().loop) {
		sound.audio().loop=true;
		sound.audio().play();
	} else {
		sound.audio().loop=false;
	}
}
function incvol(sound, amount){
	sound.audio().volume+=amount;
}

function refreshInfo(){
	if (selection.audio()!=undefined) {
		var d=new Date();
		var src="";
		try {
			var src_comp=selection.audio().currentSrc.split('/');
			src=src_comp[src_comp.length-1];
		} catch(error) {
			src=selection.audio().currentSrc;
		}
		$('#playerinfo').html("time=<i>"+selection.audio().currentTime+"</i>\tvol=<u>"+selection.audio().volume+"</u>\tfile=<b>"+src+"</b>\t(on <small>"+('0'+d.getSeconds()).slice(-2)+"."+('00'+d.getMilliseconds()).slice(-3)+"</small>)");
	}
}

$(document).keypress(function(event){
	switch(event.key) {
		case 'ArrowUp':
			incvol(selection, 0.02);
			event.preventDefault();
			break;

		case 'ArrowDown':
			incvol(selection, -0.02);
			event.preventDefault();
			break;

		case 'ArrowRight':
			seek(selection, +1);
			event.preventDefault();
			break;

		case 'ArrowLeft':
			seek(selection, -1);
			event.preventDefault();
			break;

		case ' ':
			playpause(selection);
			event.preventDefault();
			break;

		case '<':
			rewind(selection);
			event.preventDefault();
			break;

		case '=':
			loop(selection);
			event.preventDefault();
			break;

		case '?':
			$('details').attr('open', true);
			$('#info').focus();
			event.preventDefault();
			break;

		default:
			sound=$('sound[hotkey='+event.key.toLowerCase()+']');
			if (sound.length==1) {
				event.preventDefault();
				if (event.key!=event.key.toLowerCase()) {
				} else {
					if (event.ctrlKey) {
						loop(sound);
					} else {
						replay(sound);
					}
				}
				select(sound);
			} else if (sound.length!=0) {
				console.warn("Multiple sounds for hotkey "+event.key.toLowerCase());
			}
	}
	//console.log(JSON.stringify(event, null, "\t"));
	refreshInfo();
});

$(document).ready(function(){
	$.ajax("data/index.tsv", {
		dataType: 'text'
	})
		.done(function(list){
			list.trim("\n").split("\n").map(function(l){return l.trim("\t").split("\t")}).forEach(function(l){
				$('#content').append("<sound"+((l[2]!=undefined)?" hotkey=\""+l[2]+"\"":"")+"><img src=\""+l[1]+"\" /><audio controls><source src=\""+l[0]+"\" /></audio></sound>");
			});
		})
		.always(function(){ // Surely all sounds loaded
			$('sound[hotkey]').append(function(){
				return "<hotkey>"+$(this).attr('hotkey')+"</hotkey>";
			});

			$('sound >img').click(function(){
				replay($(this).parent());
				select($(this).parent());
				console.log("Click handled");
			});
			$('sound').contextmenu(function(event){
				select($(this));
				event.preventDefault();
			});
		});

	$('#info_dragbar').mousedown(function(event){
		event.preventDefault();
		$('#info').attr('dragging', true);
		var info_ghostbar = $('<div>',{
					id: 'info_ghostbar',
					css: {
						top: $('#info').offset().top,
						height: $('#info').outerHeight() +8,
						left: $('#info').offset().left,
						width: $('#info').outerWidth(),
						position: 'absolute'
					}
				}).appendTo('body');
		$(document).mousemove(function(event){
			info_ghostbar.css("top", event.pageY);
			info_ghostbar.css("height", $('#info').offset().top+$('#info').outerHeight() - event.pageY + 4);
			event.preventDefault();
		});
		event.preventDefault();
	});
	$(document).mouseup(function(event){
		if ($('#info').attr('dragging')) {
			$('#info').css('height', $('#info_ghostbar').outerHeight() -2*8 -4);
			$('#info_ghostbar').remove();
			$(document).unbind('mousemove');
			$('#info').attr('dragging', false);
			event.preventDefault();
		}
		refreshInfo();
	});

	setInterval(refreshInfo, 500);
});
