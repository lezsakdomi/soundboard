jQuery.fn.extend({
	audio: function() {
		audios=this.find('audio');
		if(audios.length!=1) return; //throw {desc: "Not one audio in sound", audio: audios, sound: this};
		return audios[0];
	}
});

selection=$("<sound></sound>");
function select(sound){
	selection.attr('selected', false);
	selection=sound;
	selection.attr('selected', "selected");
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

$(document).keypress(function(event){
	switch(event.key) {
		case ' ':
			playpause(selection);
			event.preventDefault();
			break;

		case '<':
			rewind(selection);
			event.preventDefault();
			break;

		case 'l':
			loop(selection);
			event.preventDefault();
			break;

		default:
			sound=$('sound[hotkey='+event.key.toLowerCase()+']');
			if (sound.length==1) {
				event.preventDefault();
				if (event.key!=event.key.toLowerCase()) {
					select(sound);
				} else {
					if (event.ctrlKey) {
						loop(sound);
					} else {
						replay(sound);
					}
				}
			} else if (sound.length!=0) {
				console.log("Multiple sounds for hotkey "+event.key.toLowerCase());
			}
	}
});

datadir="data";
$(document).ready(function(){
	$.ajax(datadir+"/list.tsv", {
		dataType: 'text'
	})
		.done(function(list){
			list.trim("\n").split("\n").map(function(l){return l.trim("\t").split("\t")}).forEach(function(l){
				$('#content').append("<sound"+((l[2]!=undefined)?" hotkey=\""+l[2]+"\"":"")+"><img src=\""+datadir+"/"+l[1]+"\" /><audio controls><source src=\""+datadir+"/"+l[0]+"\" /></audio></sound>");
			});
		})
		.always(function(){ // Surely all sounds loaded
			$('sound[hotkey]').append(function(){
				return "<hotkey>"+$(this).attr('hotkey')+"</hotkey>";
			});

			$('sound >img').click(function(){
				replay($(this).parent());
				select($(this).parent());
			});
		});
});
