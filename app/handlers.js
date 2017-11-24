localStorage.g3n1us_watch('message', function(prop, oldval, newval){
	if(newval.length){
		var topamt = 90 + ($('.message').length * 70);
		var randid = g3n1us_helpers.randid();

		$('<div id="'+randid+'" class="alert alert-info fixed-top message fade show" style="padding-top: 20px; position: fixed; max-width: 700px; top: '+topamt+'px; left: 0; right: 0; margin: auto; z-index: 99999; "><a class="close" style="line-height:0" data-dismiss="alert">&times;</a>'+newval+'</div>').appendTo('body');
		localStorage.message = '';
		setTimeout(function(){
			$('#'+randid).remove();
		}, 2800);
	}		
});

localStorage.g3n1us_watch('error', function(prop, oldval, newval){
	if(newval.length){
		var topamt = 90 + ($('.error').length * 70);
		var randid = g3n1us_helpers.randid();
		$('<div id="'+randid+'" class="alert alert-danger fixed-top error fade show" style="padding-top: 20px; position: fixed; max-width: 700px; top: '+topamt+'px; left: 0; right: 0; margin: auto; z-index: 99999; "><a class="close" style="line-height:0" data-dismiss="alert">&times;</a>'+newval+'</div>').appendTo('body');
		localStorage.error = '';

	}		
});

$(document).on('mousedown mouseup', '.grab, .grabbing', function(){
	$(this).toggleClass('grab grabbing');
});
$(document).on('blur dragstart', '.grab, .grabbing', function(){
	$(this).removeClass('grabbing');
	$(this).addClass('grab');
});
			
$(document).on('click', '.delete_file_button', function(e){
	e.preventDefault();
	var filepath = $(this).data('delete');
	if(confirm('Are you sure you would like to delete this file?'))
		app.deleteFile(filepath);
});
Mousetrap.bind('mod+s', function(e){
	e.preventDefault();
	$('#editorform').submit();				
});

window.submitok = false;
$(document).on('change', '[name="refreshing"]', function(){
	var val = $(this).is(':checked');
	window.submitok = true;
	$(this).blur();
});

$(document).on('click', '[data-feed_entry_id]', function(e){
	e.preventDefault();
	$(this).css('opacity', '.3');
	if(!$('form').find('[name="deletions"]').length){
		$('form').append('<input type="hidden" name="deletions">');
	}
	var current_deletions = $('[name="deletions"]').val();
	if(current_deletions.trim().length)
		current_deletions = current_deletions.split(',');
	else
		current_deletions = [];
	current_deletions.push($(this).data('feed_entry_id'));
	$('[name="deletions"]').val(current_deletions.join(','));
});


// handlers
$(document).on('click', '[data-action]', function(e){
	var fn = $(this).data('action');
	var args = $(this).data('args');
	if($(this).parents('form').length){
		args = g3n1us_helpers.form2Object($(this).parents('form'));
	}
	app[fn](args);
});

$(document).on('click', '.givewarning', function(e){
	if(!confirm('Are you sure?')) return false;
});

$(document).on('click', '#previewproject', function(){
	app.previewproject();
});

$(document).on('change', '#projectsdropdown', function(){
	window.location.hash = "/" + $(this).val();
});

$(window).on('hashchange', function(){
	localStorage.redirectTo = window.location.hash;
// 				_this.route();
});

$(window).on('beforeunload', function(){
	if(!window.ignorehash)
		localStorage.redirectTo = window.location.hash;
});

localStorage.g3n1us_watch('uploadedfile', function(prop, oldval, newval){
	if(newval.length){
		var newfile = JSON.parse(newval);
		var filename = Object.keys(newfile)[0];
		var project = app.currentroute.request('project');
		localStorage.redirectTo = '#/'+project+'/'+filename;
		newfile.name = project;
		newfile.length = 2;
		console.log(newfile);
		app.addfile(filename, newfile[filename]);
/*
		_this.get = newfile;
		_this.route();
*/
		localStorage.uploadedfile = '';					
	}		
});
			
			
