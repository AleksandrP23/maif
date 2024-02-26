function validateform($form){
	var valid = true;
	
	var msg = {
		required: 'Это поле обязательно для заполнения',
		email: 'Укажите e-mail',
		phone: 'Укажите корректный телефон',
		captcha: 'Неверный код проверки',
		error: 'Во время отправки формы возникли ошибки.',
		success: 'Ваше сообщение отправлено.'
	};
	var wrap_class = 'div,label,.sc-name-field';
	$form.find('.message-error').remove();
	$form.find('input:visible, textarea:visible, select').each(function() {
		if(!validatefield($(this)))valid = false;
	});
	return valid;
};
function validatefield($field){
	var valid = true;
	var that = $field[0];
	var wrap_class = 'div,label,.sc-name-field';
	var msg = {
		required: 'Это поле обязательно для заполнения',
		email: 'Укажите e-mail',
		phone: 'Укажите корректный телефон',
		captcha: 'Неверный код проверки',
		error: 'Во время отправки формы возникли ошибки.',
		success: 'Ваше сообщение отправлено.'
	};
	
	$field.removeClass('error');
	$field.addClass('has-successs');
	
	if($field.attr('required') == 'required') {
		switch(that.type){
			case 'checkbox':
				if(that.checked == false){
					valid = false;
					$field.addClass('error').removeClass('has-successs');
					var options = $field.data();
					var message = msg.required;
					//$field.closest(wrap_class).append('<div class="message-error message error"><p>' + message + '</p></div>');
				}
				break;
			case 'select-one':
				if(that.value == undefined || that.value==0){
					valid = false;
					$field.addClass('error').removeClass('has-successs');
					var options = $field.data();
					var message = msg.required;
					//$field.closest(wrap_class).append('<div class="message-error message error"><p>' + message + '</p></div>');
				}
				break;
			case 'email':
				var re = /.+@.+\..+/;
				if(that.value.length < 5 || !re.test(that.value)){
					valid = false;
					$field.addClass('error').removeClass('has-successs');
					var options = $field.data();
					var message = msg.email;
					$field.addClass('error').closest(wrap_class).find('.input_error').remove();
					//$field.closest(wrap_class).append('<div class="message-error message error"><p>' + message + '</p></div>');
				}
				break;
			default:
				if(that.value=='' || that.value==0){
					valid = false;
					$field.addClass('error').removeClass('has-successs');
					var options = $field.data();
					var message = msg.required;
					//$field.closest(wrap_class).append('<div class="message-error message error"><p>' + message + '</p></div>');
				}
		}
	}
	return valid;
}
$(function() {
	window.useYandexCounter = function (callback) {
		if (typeof ym != 'undefined') {
			callback(ym);
		}
	};
	window.useYandexGoal = function (target, params) {
		useYandexCounter(function (ya) {
			ya('52688932', 'reachGoal', target, params);
		});
	};
	
	$(document).on('click', '.js-popup-modal', function(){
		var $this = $(this);
		var form_id = $this.data('form_id');
		$.ajax({
			url: '/udata/webforms/getForm/'+form_id,
		 type: "POST",
		 dataType: "html",
		 success: function(data){
			 $('#modal-form-'+form_id).remove();
			 $('body').append(data);
			 $.magnificPopup.open({
				 items: {
					 src: '#modal-form-'+form_id,
					 type: 'inline'
				 }
			 });
		 }
		});
		$.magnificPopup.open({
			items: {
				src: '/udata/webforms/getForm/'+form_id
			},
			type: 'ajax',
			closeOnContentClick: false,
			closeOnBgClick: true,
			showCloseBtn: true,
		}, 0);
		$.ajax({
			url: '/udata/webforms/getForm/'+form_id,
		 type: "POST",
		 dataType: "html",
		 success: function(data){
			 $.fancybox.open({
				 src  : data,
				 type: 'inline',
			 });
		 }
		});
		return false;
	});
	
	
	$(document).on('submit', '.js-form', function(e){
		e.preventDefault();
		e.stopPropagation();
		var $form = $(this);
		var form = this;
		var valid = validateform($form);
		var btn_submit = $form.find('[type=submit]');
		valid = true;
		var data = serializeForm2($form);
		if (valid) {
			var url = '/sendmail.php';
			btn_submit.addClass('loader');
			$.ajax({
				url: url,
				data: data,
				contentType: false,
				processData: false,
				type: "POST",
				dataType: "json",
				success: function(data){
					//$form.drawmessages(data);
					if(data.result == 1){
						$form.trigger('reset');
						if($form.data('target')){
							useYandexGoal($form.data('target'));
						}
					}else{
						for (i in data.invalids) {
							var invalid = data.invalids[i];
							$('.field_'+invalid.id);
						}
					}
					btn_submit.removeClass('loader');
				}
			});
			
		}
		return false;
	});
	
	$(document).on('click', '.js-form [type=submit]', function(e){
		e.preventDefault();
		e.stopPropagation();
		var $form = $(this).closest('.js-form');
		var valid = validateform($form);
		if(valid)$form.trigger('submit');
		return false;
	});
	
	$(document).on('reset', '.js-form', function(e){
		$(this).find('input[type=text],input[type=tel],input[type=email],select,textarea').each(function(){
			if($(this).is(':visible')){
				this.value = null;
			}
		});
	});
	
	function serializeForm2($form){
		var formData = new FormData();
		$form.find('input,textarea,select').each(function(){
			var name = this.name;
			var value = this.value;
			if(this.type == 'file'){
				formData.append(name, this.files[0]);
			}else if(this.type == 'radio'){
				if(this.checked != false){
					formData.append(name, value);
				}
			}else{
				formData.append(name, value);
			}
		});
		return formData;
	}
});