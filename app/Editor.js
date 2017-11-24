var Editor = function(){
	
	var _this = this;
	
	_this.init = function(){
		editors = {}
		textareas = {};
		$('.ace').each(function(){
			var thisid = $(this).attr('id');
			// var thistype = thisid.replace('_editor', '');
			var thistype = _this.getFiletype($(this).data('path'));
			var thispath = $(this).data('path');
// 					var thismode = (thistype == "template") ? "html" : thistype;
		    editors[thisid] = ace.edit(thisid);
		    editors[thisid].setOptions({
			    maxLines: 999999999,
			    enableBasicAutocompletion: true,
		// 			    enableSnippets: true,
		        enableLiveAutocompletion: true,
		        enableEmmet: true,
			    
			});
			editors[thisid].commands.addCommand({
			    name: 'outdent',
			    bindKey: {win: 'Ctrl-[',  mac: 'Command-['},
			    exec: function(editor) {
			        editor.blockOutdent();
			    }
			});		    
			editors[thisid].commands.addCommand({
			    name: 'indent',
			    bindKey: {win: 'Ctrl-]',  mac: 'Command-]'},
			    exec: function(editor) {
			        editor.blockIndent();
			    }
			});		    
			editors[thisid].commands.addCommand({
			    name: 'indent',
			    bindKey: {win: 'Ctrl-s',  mac: 'Command-s'},
			    exec: function(editor) {
			        $('#editorform').submit();
			    }
			});		    
			
		    editors[thisid].setTheme("ace/theme/monokai");
		    editors[thisid].$blockScrolling = Infinity;
		    editors[thisid].getSession().setMode("ace/mode/" + thistype);		    
			textareas[thisid] = $('textarea[name="' + thispath + '"]').hide();
			editors[thisid].getSession().setValue(textareas[thisid].val());
			editors[thisid].getSession().on('change', function(){
				textareas[thisid].val(editors[thisid].getSession().getValue());
			});	
// 					console.log(ace);		
		});
		
	}
	
	_this.init_ckeditor = function(){
		CKEDITOR.config.embed_provider = '//iframe.ly/api/oembed?url={url}&callback={callback}&api_key=' + config.iframely_key;
		
		
		$('.ckeditor').show().ckeditor({
			stylesheetParser_skipSelectors: /(^body\.|^svg\.)/i,
						     stylesheetParser_validSelectors: /(^span\.text)/i,
			emailProtection: 'encode',
// 				imageUploadUrl : "/dashboard/upload/1/"+article_id,
			filebrowserBrowseUrl: '/#/filemanager/1',
			// templates_files: [ '/app/2016/js/ckeditor_templates.js' ],
			templates_replaceContent: false,
			//extraPlugins: 'mdc_ad,g3n1us_component',
			removePlugins: 'uploadimage,uploadfile',
			keystrokes: [
				[ CKEDITOR.CTRL + 83 /*S*/, 'save' ],
			],
			
		});

		window.ck_instances = [];		
		for(ckid in CKEDITOR.instances){
			var ckinstance = CKEDITOR.instances[ckid];	
			ck_instances.push(ckinstance);
			ckinstance.on('change', function(e){
				editor_has_changed = true;
// 				console.log(e.editor.getData());
			});
			ckinstance.on('focus', function(e){
				dropuploadok = false;
				if(typeof relatedfilessort !== "undefined")
					relatedfilessort.option('disabled', true);
			});
			ckinstance.on( 'paste', function( evt ) {
				console.log(evt);
	 			var custom_html = evt.data.dataTransfer.getData( 'custom_html' );
					console.log('custom html: ' + custom_html);

	 			var text_content = evt.data.dataTransfer.getData('text');

	 			if(is_url(text_content)){
		 			if(is_video(text_content)){
			 			evt.data.dataValue = app.templates.video_partial({src: text_content})
		 			}
		 			else{
			 			var parsed_url = parse_url(text_content);
			 			if(parsed_url.hostname == window.location.hostname){
				 			evt.data.dataValue = '<a data-oembed_url="'+text_content+'">'+text_content+'</a>';
				 			return;
			 			}
			 			
		 			}
	 			}
	 			if ( !custom_html ) {
	 				return;
	 			}
	 			else evt.data.dataValue = custom_html;
			});
			
		}

	}
	
	
	
	
	config.stylesheetParser_skipSelectors = /(^body\.|^caption\.|\.high|^\.)/i;
	_this.destroy_ckeditors = function(callback){
		for(ckid in CKEDITOR.instances){
			var ckinstance = CKEDITOR.instances[ckid];	
			ckinstance.destroy();
		}
		if(callback) callback();
	}

	
	_this.getFiletype = function(path){
		if(path.search(".css") !== -1) return "css";
		else if (path.search(".js") !== -1) return "javascript";
		else if (path.search(".json") !== -1) return "javascript";
		else if (path.search(".tpl") !== -1) return "smarty";
		else if (path.search(".hbs") !== -1) return "handlebars";
		else if (path.search(".json") !== -1) return "json";
		else if (path.search(".php") !== -1) return "php";
		else if (path.indexOf('.') === -1) return "javascript";
		else return "html";
	}		
}

if(typeof module !== "undefined")
	module.exports = Editor;
