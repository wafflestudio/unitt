var socket;

function coursebook_update(password)
{
	socket.emit('coursebook_update', {password:password});
}

function simplify_class_time(class_time)
{
	//월(1.5-1.5) -> 월
	return class_time.replace(/-[\d.,]*\)/g, ")").replace(/,[\d.,]*\)/g, ")").replace(/[()]/g, "");
}

function simplify_location(location)
{
	var arr = location.split('/');
	for (var i=0;i<arr.length-1;i++){
		for (var j=i+1;j<arr.length;j++){
			if (arr[i] == arr[j]){
				arr.splice(j,1);
				j=i;
			}
		}
	}
	return arr.join('<br />');
}

function already_owned_lecture(lecture)
{
	for (var i=0;i<my_lectures.length;i++)
		if (is_equal_lecture(my_lectures[i], lecture)) return true;
	return false;
}

function is_equal_lecture(a, b)
{
	if (a.course_number == b.course_number)
		return true;
	return false;
}

function already_exist_class_time(lecture)
{
	for (var i=0;i<my_lectures.length;i++){
		if (is_duplicated_class_time(lecture, my_lectures[i])) return true;
	}
	return false;
}

//두 강의의 시간이 겹치는지 체크
function is_duplicated_class_time(l1, l2)
{
	function increasing_sequence(a,b,c){
		if (a < b && b < c) return true;
		return false;
	}
	var t1 = l1.class_time.split("/");
	var t2 = l2.class_time.split("/");
	for (var i=0;i<t1.length;i++){
		for (var j=0;j<t2.length;j++){
			//월(3-3), 월(4-2)
			var wday1 = t1[i].charAt(0);
			var wday2 = t2[j].charAt(0);
			var time1 = t1[i].replace(/[()]/g, "").slice(1).split('-');
			var time2 = t2[j].replace(/[()]/g, "").slice(1).split('-');
			var start_time1 = parseFloat(time1[0]);
			var start_time2 = parseFloat(time2[0]);
			var duration1 = parseFloat(time1[1]);
			var duration2 = parseFloat(time2[1]);
			if (wday1 == wday2 && 
				 (increasing_sequence(start_time1, start_time2, start_time1+duration1) ||
				  increasing_sequence(start_time1, start_time2+duration2, start_time1+duration1) ||
				  increasing_sequence(start_time2, start_time1, start_time2+duration2) ||
				  increasing_sequence(start_time2, start_time1+duration1, start_time2+duration2) ||
					(start_time1 == start_time2 && duration1 == duration2)
				))
				return true;

		}
	}
	return false;
}

//GLOBAL VARIABLES
var lectures = [];
var my_lectures = [];
var query_text;
var filter;
var per_page = 30;
var page = 1;
var page_loading_complete = true;
var page_loading_requesting = false;
var selected_row;
var my_courses_selected_row;
var search_result_scroll_top = 0;
var current_tab = "search";
var gray_color = {border:"#ccc",plane:"#ddd"};
var colors = [
	{border:"#faa",plane:"#fcc"},
	{border:"#9f9",plane:"#cfc"},
	{border:"#aaf",plane:"#ccf"},
	{border:"#dd9",plane:"#ffa"},
	{border:"#d9d",plane:"#faf"},
	{border:"#9dd",plane:"#cff"}
];
var search_type = "course_title";
var current_year;
var current_semester;

var custom_start_cell;
var custom_end_cell;
var custom_wday;
var custom_start_time;
var custom_class_time;
var custom_end_cell;
var custom_end_time;
var custom_lecture_number = 1;
var coursebook_info;

function semester_to_text(semester)
{
	if (semester == '1') return '1학기';
	if (semester == '2') return '2학기';
	if (semester == 'S') return '여름학기';
	if (semester == 'W') return '겨울학기';
	return 'null';
}

function get_coursebook_info(year, semester)
{
	for (var i=0;i<coursebook_info.length;i++){
		var coursebook = coursebook_info[i];
		if (coursebook.year == year && coursebook.semester == semester)
			return coursebook;
	}
	return null;
}

function change_semester(year, semester)
{
	current_year = year;
	current_semester = semester;
	$('#semester_label').text(current_year + "-" + current_semester);
	$('#data_updated_at').text(get_coursebook_info(current_year, current_semester).updated_time);
	$('#search_query_text').focus().val("");
}

$(function(){
	socket = io.connect(':3785');
	socket.on('init_client', function(data){
		$('#init_loading_modal').dialog('close');

		coursebook_info = data.coursebook_info;

		if (!current_year && !current_semester){
			current_year = data.last_coursebook_info.year;
			current_semester = data.last_coursebook_info.semester;
		}
		//저장된 시간표 불러오기
		refresh_my_courses_table();
		generate_timecell(my_lectures);
		change_semester(current_year, current_semester);

		//학기 dropdown 메뉴 초기화
		$('#semester_label').text(current_year + "-" + current_semester);
		var semester_dropdown_ul = $('#semester_dropdown_ul');
		semester_dropdown_ul.children().remove();
		for (var i=0;i<coursebook_info.length;i++){
			var year = coursebook_info[i].year;
			var semester = coursebook_info[i].semester;
			var list = $('<li></li>').appendTo(semester_dropdown_ul).addClass('semester-li');
			var link = $('<a href="#">'+year+"년 "+semester_to_text(semester)+'</a>').attr('year', year).attr('semester', semester).appendTo(list).addClass('semester-button');
			if (year == current_year && semester == current_semester) list.addClass('selected-semester-li')
		}
		//학기 변경
		$('.semester-button').unbind('click').click(function(){
			var ele = $(this);
			if (current_year == ele.attr('year') && current_semester == ele.attr('semester')) return true;
			//학기 변경
			change_semester(ele.attr('year'), ele.attr('semester'));
			$('.selected-semester-li').removeClass('selected-semester-li');
			ele.addClass('selected-semester-li');
			//검색결과 삭제
			$('#search_result_table tbody').children().remove();
			var row = $('<tr></tr>').appendTo($('#search_result_table tbody'));
			$('<td colspan="18">검색어를 입력하세요.</td>').appendTo(row).css('text-align', 'center');
			//내 강의 초기화
			my_lectures = [];
			refresh_my_courses_table();
			generate_timecell(my_lectures);
		});
	});
	socket.on('search_result', function(data){
		page_loading_requesting = false;
		if (data.lectures.length == 0 && data.page > 1)
			page_loading_complete = true;
		else {
			set_result_table(data);
			$('#nav_search_result').tab('show');
		}
	});
	socket.on('facebook_publish_complete', function(data){
		$('#publish_facebook_ok_button').removeAttr('disabled');
		$('#facebook_loading_modal').dialog('close');
		if (data.data.error){
			alert('업로드에 실패했습니다.');
		}
		else {
			alert('성공적으로 게시되었습니다!');
			$('#facebook_message').val("");
			$('#facebook_message_wrapper').slideUp();
			$('#publish_facebook_toggle_button').attr('state', 'off').removeClass('dropup');
		}
	});
	socket.on('export_timetable_result', function(data){
		$('#saved_timetable_url').attr('href', '/user/'+data.filename).text("http://hufstt.kr/user/"+data.filename);
	});

	//SNUTT 로고 클릭
	$('#brand_button').click(function(){
		$('#nav_search_result').trigger('click');
		return false;
	});

	//resize
	$(window).resize(function(){
		if (selected_row) selected_row.trigger('click');
		else generate_timecell(my_lectures);
	});

	//tab transition
	$('a[data-toggle="tab"]').on('show', function (e) {
		switch ($(e.target).attr('href')){
		case "#my_courses": 
			current_tab = "my_courses";
			break;
		case "#search":
			current_tab = "search";
			break;
		}
	})
	$('a[data-toggle="tab"]').on('shown', function (e) {
		switch ($(e.target).attr('href')){
		case "#my_courses": 
			generate_timecell(my_lectures);
			break;
		case "#search":
			$('#lectures_content').scrollTop(search_result_scroll_top);
			break;
		}
	})

	//set tooltip
	$('#nav_my_courses').tooltip({
		placement : 'bottom',
		trigger : 'manual',
		title : "강의가 추가되었습니다.",
		animation : false
	}).tooltip('show');
	$('.tooltip').addClass('my-course-tooltip').hide();

	//set tooltip
	$('#search_filter_toggle_button').tooltip({
		placement : 'right',
		trigger : 'manual',
		title : "강의가 추가되었습니다.",
		animation : false
	}).tooltip('show');
	$('.tooltip:last').addClass('search-filter-tooltip').hide();

	//scroll change
	$('#lectures_content').scroll(function(){
		if (current_tab == "search"){
			var ele = $(this);
			var scrollHeight = ele.get(0).scrollHeight;
			var scrollTop = ele.scrollTop();
			var scrollBottom = ele.scrollTop() + ele.height();
			var difference = scrollHeight - scrollBottom;
			//현재 scroll 위치 갱신
			search_result_scroll_top = scrollTop;
			//스크롤이 충분히 밑으로 내려가면 다음 페이지 로딩
			if (difference < 200 && !page_loading_requesting && !page_loading_complete){
				page++;
				socket.emit('search_query', {
					year:current_year,
					semester:current_semester,
					filter:filter,
					type:search_type,
					query_text:query_text,
					page:page,
					per_page:per_page
				});
				page_loading_requesting = true;
			}
		}
	});
		
	//search query
	$('#search_form').submit(function(){
		query_text = $('#search_query_text').val();
		page = 1;
		page_loading_complete = false;
		filter = get_filter();
		socket.emit('search_query', {
			year:current_year,
			semester:current_semester,
			filter:filter,
			type:search_type,
			query_text:query_text,
			page:page,
			per_page:per_page
		});
		cancel_lecture_selection();
		return false;
	});

	//표의 빈공간 클릭 시 gray-cell 삭제
	$('#timetable tbody td').click(function(){
		cancel_lecture_selection();
	});

	//검색필터 on/off 토글
	$('#search_filter_toggle_button').click(function(){
		var ele = $(this);
		if (ele.attr('state') == 'off'){
			ele.attr('state', 'on').addClass('btn-info').addClass('dropup');
			search_filter_tooltip_message('검색필터가 켜졌습니다.');
			$('#search_filter').slideDown();
		}
		else {
			ele.attr('state', 'off').removeClass('btn-info').removeClass('dropup');
			search_filter_tooltip_message('검색필터가 꺼졌습니다.');
			$('#search_filter').slideUp();
		}
	});
	$('#search_filter').hide();
	//검색필터 라벨 클릭
	$('#search_filter .label').click(function(){
		var ele = $(this);
		if (!ele.hasClass('label-info')) ele.addClass('label-info');
		else ele.removeClass('label-info');
	});
	//검색필터 라벨 더블클릭
	$('#search_filter .label').dblclick(function(){
		var ele = $(this);
		ele.parent().children().removeClass('label-info');
		ele.addClass('label-info');
	}).addSwipeEvents().bind('doubletap', function(evt, touch) {
		var ele = $(this);
		ele.parent().children().removeClass('label-info');
		ele.addClass('label-info');
	});

	$('#search_filter .header').click(function(){
		var header = $(this);
		var selected = header.siblings('.label-info');
		var all = header.siblings('.label');
		//전부 선택되어있으면 전체선택 해제
		if (all.size() == selected.size()){
			all.removeClass('label-info');
		}else {
			all.addClass('label-info');
		}
	});


	function pagedown_element(ele){
		for (var i=0;i<7 && ele.next().length > 0;i++)
			ele = ele.next();
		return ele;
	}

	function pageup_element(ele){
		for (var i=0;i<7 && ele.prev().length > 0;i++)
			ele = ele.prev();
		return ele;
	}

	$('body').keydown(function(e){
		if (e.keyCode == 34 && current_tab == "search"){
			//pagedown
			//선택된 것이 없으면 1번째 row 선택
			if (!selected_row && lectures.length > 0){
				$('#search_result_table tbody tr').first().trigger('click');
				$('#search_query_text').blur();
			}
			else if (selected_row && pagedown_element(selected_row).length > 0){
				pagedown_element(selected_row).trigger('click');
				var new_position = selected_row.position().top - selected_row.parent().position().top + 26 - 110;
				$('#lectures_content').scrollTop(new_position);
				$('#search_query_text').blur();
			}
			return false;
		}
		else if (e.keyCode == 33 && current_tab == "search"){
			//pageup
			if (!selected_row && lectures.length > 0){
				$('#search_result_table tbody tr').first().trigger('click');
				selected_row.addClass('selected');
				$('#search_query_text').blur();
			}
			else if (selected_row && pageup_element(selected_row).length > 0){
				pageup_element(selected_row).trigger('click');
				var new_position = selected_row.position().top - selected_row.parent().position().top + 26 - 110;
				$('#lectures_content').scrollTop(new_position);
				$('#search_query_text').blur();
			}
			return false;
		}
		else if (e.keyCode == 40 && current_tab == "search"){
			//down
			//선택된 것이 없으면 1번째 row 선택
			if (!selected_row && lectures.length > 0){
				$('#search_result_table tbody tr').first().trigger('click');
				$('#search_query_text').blur();
			}
			else if (selected_row && selected_row.next().length > 0){
				selected_row.next().trigger('click');
				set_scroll_to_selected_row();
				$('#search_query_text').blur();
			}
			return false;
		}
		else if (e.keyCode == 38 && current_tab == "search"){
			//up
			if (!selected_row && lectures.length > 0){
				$('#search_result_table tbody tr').first().trigger('click');
				selected_row.addClass('selected');
				$('#search_query_text').blur();
			}
			else if (selected_row && selected_row.prev().length > 0){
				selected_row.prev().trigger('click');
				set_scroll_to_selected_row();
				$('#search_query_text').blur();
			}
			return false;
		}
		//내 강의
		else if (e.keyCode == 40 && current_tab == "my_courses"){
			//down
			//선택된 것이 없으면 1번째 row 선택
			if (!my_courses_selected_row && my_lectures.length > 0){
				$('#my_courses_table tbody tr').first().trigger('click');
				$('#search_query_text').blur();
			}
			else if (my_courses_selected_row && my_courses_selected_row.next().length > 0){
				my_courses_selected_row.next().trigger('click');
				set_scroll_to_my_courses_selected_row();
				$('#search_query_text').blur();
			}
			return false;
		}
		else if (e.keyCode == 38 && current_tab == "my_courses"){
			//up
			if (!my_courses_selected_row && my_lectures.length > 0){
				$('#my_courses_table tbody tr').first().trigger('click');
				$('#search_query_text').blur();
			}
			else if (my_courses_selected_row && my_courses_selected_row.prev().length > 0){
				my_courses_selected_row.prev().trigger('click');
				set_scroll_to_my_courses_selected_row();
				$('#search_query_text').blur();
			}
			return false;
		}
		else if (e.keyCode == 13 && current_tab == "search"){
			//enter
			if (selected_row && $('#search_query_text:focus').size() == 0){
				selected_row.trigger('dblclick');
			}
		}
		else if (e.keyCode == 13 && current_tab == "my_courses"){
			//enter
			if (my_courses_selected_row && $('#search_query_text:focus').size() == 0){
				my_courses_selected_row.trigger('dblclick');
			}
		}
		else {
			//$('#search_query_text').focus();
		}
	});	

	//search type 설정
	//교과목명
	$('#stype_course_title').click(function(){
		$('#stype_dropdown_label').text("교과목명");
		$('#search_query_text').attr('placeholder', "예) ");
		search_type = "course_title";
		$('#search_query_text').focus().val("");
	});
	//교수명
	$('#stype_instructor').click(function(){
		$('#stype_dropdown_label').text("교수명");
		$('#search_query_text').attr('placeholder', "예) 최영석");
		search_type = "instructor";
		$('#search_query_text').focus().val("");
	});
	//학수번호
	$('#stype_course_number').click(function(){
		$('#stype_dropdown_label').text("학수번호");
		$('#search_query_text').attr('placeholder', "예) D02103301");
		search_type = "course_number";
		$('#search_query_text').focus().val("");
	});
	//수업교시
	$('#stype_class_time').click(function(){
		$('#stype_dropdown_label').text("수업교시");
		$('#search_query_text').attr('placeholder', "예) 월2, 화6, 금");
		search_type = "class_time";
		$('#search_query_text').focus().val("");
	});
	//개설학과
	$('#stype_department').click(function(){
		$('#stype_dropdown_label').text("개설학과");
		$('#search_query_text').attr('placeholder', "예) 국통");
		search_type = "department";
		$('#search_query_text').focus().val("");
	});

	//init modal
	$('#init_loading_modal').dialog({
		modal:true,
		hide:"fade",
		resizable:false,
		closeOnEscape:false,
		dialogClass:"no-title",
		autoOpen:true
	});

	//facebook modal
	$('#facebook_loading_modal').dialog({
		modal:true,
		resizable:false,
		closeOnEscape:false,
		dialogClass:"no-title",
		autoOpen:false
	});

	//custom lecture modal
	$('#custom_lecture_modal').dialog({
		modal:true,
		title:"사용자정의 시간표",
		dialogClass:"custom-lecture-dialog",
		width:250,
		height:190,
		open:function(){
			$('#custom_course_title').val("");
			$('#custom_location').val("");
			cancel_lecture_selection();
		},
		close:function(){
			$('#customcell').hide();
			custom_class_time = null;
		},
		resizable:false,
		autoOpen:false
	});

	//detail dialog
	$('#course_detail_wrapper').draggable({
		handle:'.course-title',
		containment:"body"
	}).css('right', 0);
	$('#course_detail_wrapper').hide();

	//강의계획서 버튼
	$('#course_detail_plan_button').click(function(){
		var ele = $(this);
		show_course_detail({
			year:current_year,
			semester:current_semester,
			sector_char: ele.attr('sector-char'),
			course_number:ele.attr('course-number')
		});
	});

	$('#custom_lecture_close_button').click(function(){
		$('#custom_lecture_modal').dialog('close');
		return false;
	});

	//페이스북에 공유하기
	$('#publish_facebook_toggle_button').click(function(){
		var ele = $(this);
		if (ele.attr('state') == 'off'){
			ele.attr('state', 'on').addClass('dropup');
			$('#facebook_message_wrapper').slideDown();
			$('#facebook_message').focus();
		}
		else {
			ele.attr('state', 'off').removeClass('dropup');
			$('#facebook_message').blur();
			$('#facebook_message_wrapper').slideUp();
		}
		return false;
	});
	$('#facebook_message_wrapper').hide();

	//페이스북에 올리기
	$('#facebook_message_wrapper').submit(function(){
		var ele = $('#publish_facebook_ok_button');
		if (!ele.attr('disabled')){
			ele.attr('disabled', true);

			FB.login(function(response){
				if (response.authResponse){
					var access_token = response.authResponse.accessToken;
					var base64_data = $('.timetable-image').attr('src').replace(/data:image\/png;base64,/, "");
					var message = $("#facebook_message").val();
					socket.emit('publish_timetable_to_facebook', {
						access_token:access_token,
						base64_data:base64_data,
						message:message
					});
					$('#facebook_message').blur();
					$('#facebook_loading_modal').dialog('open');
				}
				else {
					alert("페이스북 로그인에 실패했습니다.");
					ele.removeAttr('disabled');
				}
			}, {scope:'publish_stream'});
		}
		return false;
	});

	//custom lecture form submit
	$('#custom_lecture_form').submit(function(){
		var course_title = $('#custom_course_title').val();
		var location = $('#custom_location').val();
		var custom_lecture = {
			course_number : "custom",
			course_title : course_title,
			class_time : custom_class_time,
			location : location,
			color : generate_random_color(),
			credit : 0
		};
		my_lectures.push(custom_lecture);
		refresh_my_courses_table();
		generate_timecell(my_lectures);
		my_course_tooltip_message("강의가 추가되었습니다.");
		$('#custom_lecture_modal').dialog('close');
		return false;
	});
	
	//contents scroll
	touchScroll('lectures_content');

	//custom time 추가
	function wday_string(wday)
	{
		if (wday == "mon") return "월";
		if (wday == "tue") return "화";
		if (wday == "wed") return "수";
		if (wday == "thu") return "목";
		if (wday == "fri") return "금";
		if (wday == "sat") return "토";
		return "";
	}
	$('#timetable tbody td').mousedown(function(e){
		custom_start_cell = $(this);

		custom_wday = wday_string(custom_start_cell.attr('class'));
		custom_start_time = parseFloat(custom_start_cell.attr('time'));
	}).mousemove(function(e){
		if (custom_start_cell){
			custom_end_cell = $(this);
			custom_end_time = Math.max(parseFloat(custom_end_cell.attr('time')), custom_start_time) + 0.5;
			if (custom_class_time == (custom_wday + "(" + custom_start_time + "-" + (custom_end_time - custom_start_time) + ")"))
				return false;

			custom_class_time = custom_wday + "(" + custom_start_time + "-" + (custom_end_time - custom_start_time) + ")";
			generate_custom_cell({class_time : custom_class_time});
		}
		return false;
	});
	$('body').mouseup(function(e){
		//선택된 칸이 한칸 이상이어야..
		if (custom_end_cell){
			if (already_exist_class_time({class_time:custom_class_time})){
				alert("강의시간이 겹칩니다.");
				$('#customcell').hide();
				custom_class_time = null;
			}
			else {
				$('#ui-dialog-title-custom_lecture_modal').text('사용자정의 시간표 - ' + custom_class_time);
				$('#custom_lecture_modal').dialog('open');
			}
		}
		custom_start_cell = null;
		custom_end_cell = null;
	});
	//내보내기 네비게이션
	$('#nav_export').click(function(){
		if (current_tab == "export") return false;
		//브라우저가 canvas.toDataURL을 지원할 때에만..
		if (!supportsToDataURL()){
			alert("현재 사용중인 브라우저에선 이미지 내보내기 기능을 지원하지 않습니다.");
			$('#image_export_wrapper').hide();
		}
		else {
			export_timetable();
		}
		socket.emit('export_timetable', {
			year:current_year,
			semester:current_semester,
			my_lectures:my_lectures
		});
		$('#content_wrapper').hide();
		$('#export_wrapper').show();
		$('#social_comment_wrapper').hide();
		current_tab = "export";
		cancel_lecture_selection();
	});
	$('#main_navigation a').not('#nav_export').not('#nav_social_comment').not('#semester_label_button').click(function(){
		$('#content_wrapper').show();
		$('#export_wrapper').hide();
		$('#social_comment_wrapper').hide();
		generate_timecell(my_lectures);
	});
	$('#export_wrapper').hide();
	$('#social_comment_wrapper').hide();

	//소셜댓글 네비게이션
	$('#nav_social_comment').click(function(){
		$('#content_wrapper').hide();
		$('#export_wrapper').hide();
		$('#social_comment_wrapper').show();
		current_tab = "social_comment";
		cancel_lecture_selection();
	});

	$('.search-result-table').disableSelection();
	$('#timetable_container').disableSelection();

	$('.course_detail_toggle').click(function(){
		var ele = $(this);
		var course_detail = $('#course_detail');
		if (ele.attr('id') == "course_detail_contract"){
			course_detail.slideUp();
			ele.hide();
			$('#course_detail_expand').show();
		}
		else {
			course_detail.slideDown();
			ele.hide();
			$('#course_detail_contract').show();
		}
	});


	//document load end//
});

function generate_custom_cell(lecture)
{
	var unitcell_width = $('#timetable tbody td').width()+2;
	var unitcell_height = $('#timetable tbody td').height()+2;
	var leftcell_width = $('#timetable tbody th').width()+2;
	var topcell_height = $('#timetable thead th').height()+2;
	var border_weight = 3;
	//시간이 유효하지 않으면 스킵
	if (wday_to_num(lecture.class_time.charAt(0)) == -1) return;

	var class_time = lecture.class_time;
	//setup variables
	var wday = wday_to_num(class_time.charAt(0));
	var start_time = parseFloat(class_time.replace(/[()]/g,"").split('-')[0].slice(1))*2;
	var duration = parseFloat(class_time.replace(/[()]/g,"").split('-')[1])*2;
	//기준 셀
	var criteria_cell = $($('#timetable td')[6*start_time+wday]);
	var criteria_cell2;
	if (wday == 5 || wday == 4) criteria_cell2 = criteria_cell.prev();
	else criteria_cell2 = criteria_cell.next();
	
	var width = Math.abs(criteria_cell2.position().left - criteria_cell.position().left) - 2*border_weight;
	var height = (unitcell_height)*duration - border_weight*2;
	var left = criteria_cell.position().left - criteria_cell.parent().position().left;
	var top = criteria_cell.position().top - criteria_cell.parent().parent().position().top + topcell_height;

	//create container
	var customcell = $('#customcell').css('left', left).css('top', top).width(width).height(height).show();
}

function get_filter()
{
	if ($('#search_filter_toggle_button').attr('state') == 'off') return null;
	var result = {};
	//학년
	var academic_year = [];
	$('#filter_academic_year .label-info').each(function(i){
		academic_year.push($(this).attr('value'));
	});
	if (academic_year.length > 0)
		result.academic_year = academic_year;

	//학점
	var credit = [];
	$('#filter_credit .label-info').each(function(i){
		credit.push($(this).attr('value'));
	});
	if (credit.length > 0)
		result.credit = credit;

	//실용외국어
	var practical_foreign_language = [];
	$('#filter_practical_foreign_language .label-info').each(function(i){
		practical_foreign_language.push($(this).attr('value'));
	});
	if (practical_foreign_language.length > 0)
		result.practical_foreign_language = practical_foreign_language;

	//교양과목
	var liberal_arts = [];
	$('#filter_liberal_arts .label-info').each(function(i){
		liberal_arts.push($(this).attr('value'));
	});
	if (liberal_arts.length > 0)
		result.liberal_arts = liberal_arts;

	//기타
	var etc = [];
	$('#filter_etc .label-info').each(function(i){
		etc.push($(this).attr('value'));
	});
	if (etc.length > 0)
		result.etc = etc;

	return result;
}

function set_scroll_to_selected_row()
{
	if (selected_row){
		var new_position = selected_row.position().top - selected_row.parent().position().top + 26 - 110;
		$('#lectures_content').scrollTop(new_position);
	}
}

function set_scroll_to_my_courses_selected_row()
{
	if (my_courses_selected_row){
		var new_position = my_courses_selected_row.position().top - my_courses_selected_row.parent().position().top + 26 - 110;
		$('#lectures_content').scrollTop(new_position);
	}
}


function get_lecture_by_course_number(course_number)
{
	course_number = course_number || "";
	for (var i=0;i<lectures.length;i++){
		if(lectures[i].course_number == course_number)
			return lectures[i];
	}
	return null;
}

function get_my_lecture_by_course_number(course_number)
{
	course_number = course_number || "";
	for (var i=0;i<my_lectures.length;i++){
		if(my_lectures[i].course_number == course_number)
			return my_lectures[i];
	}
	return null;
}

function wday_to_num(wday){
	if (wday == "월") return 0;
	if (wday == "화") return 1;
	if (wday == "수") return 2;
	if (wday == "목") return 3;
	if (wday == "금") return 4;
	if (wday == "토") return 5;
	return -1;
}

function generate_random_color(color)
{
	if (!color)	return colors[Math.floor(colors.length * Math.random())];
	var result = colors[Math.floor(colors.length * Math.random())];
	while (result.plane == color.plane){
		result = colors[Math.floor(colors.length * Math.random())];
	}
	return result;
}

function generate_timecell(lectures)
{
	$('.timecell-container').remove();
	var unitcell_width = $('#timetable tbody td').width()+2;
	var unitcell_height = $('#timetable tbody td').height()+2;
	var leftcell_width = $('#timetable tbody th').width()+2;
	var topcell_height = $('#timetable thead th').height()+2;
	var border_weight = 3;

	for (var a=0;a<lectures.length;a++){
		var lecture = lectures[a];
		//시간이 유효하지 않으면 스킵
		if (wday_to_num(lecture.class_time.charAt(0)) == -1) continue;
		//cell 색깔 설정
		if (!lecture.color) generate_random_color(lecture.color);

		var class_times = lecture.class_time.split("/");
		var locations = lecture.location.split("/");
		for (var i=0;i<class_times.length;i++){
			//setup variables
			var wday = wday_to_num(class_times[i].charAt(0));
			var start_time = parseFloat(class_times[i].replace(/[()]/g,"").split('-')[0].slice(1))*2;
			var duration = parseFloat(class_times[i].replace(/[()]/g,"").split('-')[1])*2;
			//기준 셀
			var criteria_cell = $($('#timetable td')[6*start_time+wday]);
			var criteria_cell2;
			if (wday == 5 || wday == 4) criteria_cell2 = criteria_cell.prev();
			else criteria_cell2 = criteria_cell.next();
			
			var width = Math.abs(criteria_cell2.position().left - criteria_cell.position().left) - 2*border_weight;
			var height = (unitcell_height)*duration - border_weight*2;
			var left = criteria_cell.position().left - criteria_cell.parent().position().left;
			var top = criteria_cell.position().top - criteria_cell.parent().parent().position().top + topcell_height;

			//create container
			var container = $('<div></div>').addClass('timecell-container').appendTo($('#timecells_container'));
			var tdiv = $('<div></div>').addClass('timecell').width(width).height(height).css('left', left).css('top', top).css('background-color', lecture.color.plane).css('border-color', lecture.color.border).appendTo(container);
			$('<span></span>').text(lecture.course_title).appendTo(tdiv);
			$('<br />').appendTo(tdiv);
			$('<span></span>').text(locations[i]).appendTo(tdiv);
			//gray cell이면 gray-cell 클래스 추가
			if (lecture.color == gray_color)
				tdiv.addClass('gray-cell');

			tdiv.attr('course-number', lecture.course_number);
		}
	}
	//graycell click event 추가
	$('.gray-cell').click(function(){
		if (selected_row)
			row_dblclick_handler(selected_row);
		return false;
	});

	//timecell click event bind : 색깔 바꾸기
	$('.timecell').click(function(){
		var ele = $(this);
		var lecture = get_my_lecture_by_course_number(ele.attr('course-number'));
		if (lecture && !ele.hasClass('gray-cell')){ //회색이 아닐때만 바꿈
			lecture.color = generate_random_color(lecture.color);
			$('.timecell').each(function(x){
				var cell = $(this);
				if (cell.attr('course-number') == ele.attr('course-number') && cell.attr('lecture-number') == ele.attr('lecture-number'))
					cell.css('background-color', lecture.color.plane).css('border-color', lecture.color.border);
			});
		}
	});

	//timecell dblclick event bind
	$('.timecell').dblclick(function(){
		timecell_dblclick_handler($(this));
	}).addSwipeEvents().bind('doubletap', function(evt, touch) {
		timecell_dblclick_handler($(this));
	})
}

function my_course_tooltip_message(message)
{
	$('.my-course-tooltip .tooltip-inner').text(message);
	$('.my-course-tooltip').hide().stop(true,true).fadeIn(500, function(){
		$('.my-course-tooltip').stop(true,true).animate({color:"#fff"}, 1000, function(){
			$('.my-course-tooltip').stop(true,true).fadeOut(500);
		});
	});
}

function search_filter_tooltip_message(message)
{
	$('.search-filter-tooltip .tooltip-inner').text(message);
	$('.search-filter-tooltip').hide().stop(true,true).fadeIn(500, function(){
		$('.search-filter-tooltip').stop(true,true).animate({color:"#fff"}, 1000, function(){
			$('.search-filter-tooltip').stop(true,true).fadeOut(500);
		});
	});
}

function remove_lecture_from_my_lectures(lecture)
{
	//선택된 강의를 my_lectures에서 제거한다.
	if (lecture){
		lecture.color = null;
		for (var i=0;i<my_lectures.length;i++){
			if (is_equal_lecture(my_lectures[i], lecture)){
				my_lectures.splice(i,1);
				break;
			}
		}
		refresh_my_courses_table();
		generate_timecell(my_lectures);
		my_course_tooltip_message("강의가 제거되었습니다.");
	}
}

function timecell_dblclick_handler(ele)
{
	var lecture = get_my_lecture_by_course_number(ele.attr('course-number'));
	//더블클릭하면 삭제
	var con = confirm("["+lecture.course_title+"]를 시간표에서 제거하시겠습니까?");
	if (con){
		remove_lecture_from_my_lectures(lecture);
	}
}

function my_courses_row_click_handler()
{
	if (my_courses_selected_row){
		my_courses_selected_row.removeClass('selected');
	}
	var ele = $(this);
	ele.addClass('selected');
	my_courses_selected_row = ele;
	//remove 버튼 추가
	$('.remove-course-button').remove();
	var course_title = my_courses_selected_row.find('.course-title');
	var remove_button = $('<span class="badge badge-important">제거</span>').addClass('remove-course-button').appendTo(course_title);
	//remove 버튼 핸들러 추가
	remove_button.click(function(){
		if (my_courses_selected_row) my_courses_selected_row.trigger('dblclick');
	});

	//timetable refreshing
	var selected_lecture = get_my_lecture_by_course_number(ele.attr('course-number'));
	if (!selected_lecture.color)
		selected_lecture.color = gray_color;
	generate_timecell(my_lectures.concat([selected_lecture]));

	//refresh course detail
	refresh_course_detail(selected_lecture);
}

function row_click_handler()
{
	if (selected_row)
		selected_row.removeClass('selected');
	var ele = $(this);
	ele.addClass('selected');
	selected_row = ele;
	//add 버튼 추가
	$('.add-course-button').remove();
	var course_title = selected_row.find('.course-title');
	var add_button = $('<span class="badge badge-success">추가</span>').addClass('add-course-button').appendTo(course_title);
	//add버튼 핸들러 추가
	add_button.click(function(){
		if (selected_row) selected_row.trigger('dblclick');
	});

	//timetable refreshing
	var selected_lecture = get_lecture_by_course_number(ele.attr('course-number'));
	if (!selected_lecture.color)
		selected_lecture.color = gray_color;
	generate_timecell(my_lectures.concat([selected_lecture]));

	//refresh course detail
	refresh_course_detail(selected_lecture);
}

function refresh_course_detail(selected_lecture)
{
	$('#course_detail_wrapper #course_detail_title').text(s(selected_lecture.course_title));
	$('#course_detail_wrapper .campus').text(s(selected_lecture.campus));
	$('#course_detail_wrapper .course-number').text(s(selected_lecture.course_number));
	$('#course_detail_wrapper .classification').text(s(selected_lecture.classification));
	$('#course_detail_wrapper .department').text(s(selected_lecture.department));
	$('#course_detail_wrapper .academic-year').text(s(selected_lecture.academic_year));
	$('#course_detail_wrapper .credit').text(s(selected_lecture.credit));
	$('#course_detail_wrapper .class-time').text(s(selected_lecture.class_time));
	$('#course_detail_wrapper .instructor').text(s(selected_lecture.instructor));
	$('#course_detail_wrapper .location').text(s(selected_lecture.location));
	$('#course_detail_wrapper .quota').text(s(selected_lecture.quota));
	$('#course_detail_wrapper .enrollment').text(s(selected_lecture.enrollment));
	$('#course_detail_wrapper .remark').text(s(selected_lecture.remark));
	$('#course_detail_rating').children().remove();
	$('#course_detail_plan_button').attr('course-number', selected_lecture.course_number).attr('sector-char', selected_lecture.sector_char);
	$('#course_detail_wrapper').fadeIn();
}

function my_courses_row_dblclick_handler(ele)
{
	var selected_lecture = get_my_lecture_by_course_number(ele.attr('course-number'));
	remove_lecture_from_my_lectures(selected_lecture);
}

function row_dblclick_handler(ele)
{
	var selected_lecture = get_lecture_by_course_number(ele.attr('course-number'));
	if (selected_lecture){
		//selected_lecture가 이미 들어있지 않으면
		if (already_owned_lecture(selected_lecture)){
			alert("이미 넣은 강의입니다.");
		}
		//강의 시간이 겹치면
		else if (already_exist_class_time(selected_lecture)){
			alert("강의시간이 겹칩니다.");
		}
		else {
			selected_lecture.color = generate_random_color(selected_lecture.color);
			my_lectures.push(selected_lecture);
			generate_timecell(my_lectures);
			refresh_my_courses_table();
			my_course_tooltip_message("강의가 추가되었습니다.");
		}
	}
}

function cancel_lecture_selection()
{
	$('.selected').removeClass('selected');
	$('.add-course-button').remove();
	$('.remove-course-button').remove();
	selected_row = null;
	my_courses_selected_row = null;
	generate_timecell(my_lectures);
	$('#course_detail_wrapper').fadeOut();
}

function refresh_my_courses_table()
{
	$('#my_courses_table tbody').children().remove();
	var credit = 0;
	for (var i=0;i<my_lectures.length;i++){
		var lecture = my_lectures[i];
		credit += parseInt(lecture.credit);
		var row = $('<tr></tr>').attr('course-number', lecture.course_number);
		$('<td></td>').addClass('sector').appendTo(row).text(lecture.sector);
		$('<td></td>').addClass('course-number').appendTo(row).text(lecture.course_number);
		var course_title = $('<td></td>').addClass('course-title').appendTo(row).text(lecture.course_title+" ");
		$('<td></td>').addClass('department').appendTo(row).text(lecture.department);
		$('<td></td>').addClass('classification').appendTo(row).text(lecture.classification);
		$('<td></td>').addClass('academic-year').appendTo(row).text(lecture.academic_year);
		$('<td></td>').addClass('credit').appendTo(row).text(lecture.credit);
		$('<td></td>').addClass('class-time').appendTo(row).text(simplify_class_time(lecture.class_time));
		$('<td></td>').addClass('location').appendTo(row).html(simplify_location(lecture.location));
		$('<td></td>').addClass('instructor').appendTo(row).text(lecture.instructor);
		$('<td></td>').addClass('quota').appendTo(row).text(lecture.quota);
		$('<td></td>').addClass('enrollment').appendTo(row).text(lecture.enrollment);
		$('<td></td>').addClass('features').appendTo(row).text(s(lecture.essential_major) + " " + s(lecture.team_teaching) + " " + s(lecture.cyber) + " " + s(lecture.native));
		$('<td></td>').addClass('remark').appendTo(row).text(lecture.remark);

		row.appendTo($('#my_courses_table tbody'));
		//bind row click event
		row.click(my_courses_row_click_handler);
		//bind row dblclick event
		row.dblclick(function(){
			my_courses_row_dblclick_handler($(this));
		});
		row.addSwipeEvents().bind('doubletap', function(evt, touch) {
			my_courses_row_dblclick_handler($(this));
		})

	}

	if (my_lectures.length == 0){
		var row = $('<tr></tr>').appendTo($('#my_courses_table tbody'));
		$('<td colspan="18">선택된 강의가 없습니다.</td>').appendTo(row).css('text-align', 'center');
	}
	//총 학점 갱신
	$('#my_courses_credit').text(credit+"학점");
	my_courses_selected_row = null;
}

function set_result_table(data)
{
	if (data.page == 1){
		$('#search_result_table tbody').children().remove();
		$('#lectures_content').scrollTop(0);
		if (selected_row) selected_row.removeClass('selected');
		selected_row = null;
		lectures = [];
	}
	lectures = lectures.concat(data.lectures);
	for (var i=0;i<data.lectures.length;i++){
		var lecture = data.lectures[i];
		var row = $('<tr></tr>').attr('course-number', lecture.course_number);
		$('<td></td>').addClass('sector').appendTo(row).text(lecture.sector);
		$('<td></td>').addClass('course-number').appendTo(row).text(lecture.course_number);
		var course_title = $('<td></td>').addClass('course-title').appendTo(row).text(lecture.course_title+" ");
		$('<td></td>').addClass('department').appendTo(row).text(lecture.department);
		$('<td></td>').addClass('classification').appendTo(row).text(lecture.classification);
		$('<td></td>').addClass('academic-year').appendTo(row).text(lecture.academic_year);
		$('<td></td>').addClass('credit').appendTo(row).text(lecture.credit);
		$('<td></td>').addClass('class-time').appendTo(row).text(simplify_class_time(lecture.class_time));
		$('<td></td>').addClass('location').appendTo(row).html(simplify_location(lecture.location));
		$('<td></td>').addClass('instructor').appendTo(row).text(lecture.instructor);
		$('<td></td>').addClass('quota').appendTo(row).text(lecture.quota);
		$('<td></td>').addClass('enrollment').appendTo(row).text(lecture.enrollment);
		var features = [];
		if (lecture.essential_major) features.push(lecture.essential_major);
		if (lecture.team_teaching) features.push(lecture.team_teaching);
		if (lecture.cyber) features.push(lecture.cyber);
		if (lecture.native) features.push(lecture.native);
		$('<td></td>').addClass('features').appendTo(row).text(features.join(', '));
		$('<td></td>').addClass('remark').appendTo(row).text(lecture.remark);

		row.appendTo($('#search_result_table tbody'));
		//bind row click event
		row.click(row_click_handler);
		//bind row dblclick event
		row.dblclick(function(){
			row_dblclick_handler($(this));
		});
		row.addSwipeEvents().bind('doubletap', function(evt, touch) {
			row_dblclick_handler($(this));
		})
	}
	if (data.lectures.length == 0){
		var row = $('<tr></tr>').appendTo($('#search_result_table tbody'));
		$('<td colspan="18">'+data.query.query_text+' : 검색 결과가 없습니다.</td>').appendTo(row).css('text-align', 'center');
	}
}

function show_course_detail(options)
{
	function semester_map(semester){
		if (semester == '1')
			return '1';
		if (semester == 'S')
			return '2';
		if (semester == '2')
			return '3';
		if (semester == 'W')
			return '4';
	}
	var year = options.year;
	var semester = options.semester;
	var course_number = options.course_number;
	var sector_char = options.sector_char;
	var url = "http://webs.hufs.ac.kr:8989/src08/jsp/lecture/syllabus.jsp?ledg_year="+year+"&ledg_sessn="+semester_map(semester)+"&org_sect="+sector_char+"&lssn_cd="+course_number;
	window.open(url);
}

function isTouchDevice(){
	try{
		document.createEvent("TouchEvent");
		return true;
	}catch(e){
		return false;
	}
}

function touchScroll(id){
	if(isTouchDevice()){ //if touch events exist...
		var el=document.getElementById(id);
		var scrollStartPos=0;

		document.getElementById(id).addEventListener("touchstart", function(event) {
			scrollStartPos=this.scrollTop+event.touches[0].pageY;
			//event.preventDefault();
		},false);

		document.getElementById(id).addEventListener("touchmove", function(event) {
			this.scrollTop=scrollStartPos-event.touches[0].pageY;
			event.preventDefault();
		},false);
	}
}

function s(str)
{
	if (!str) return "";
	return String(str);
}


//파이어폭스 드래그 금지
/*
var omitformtags=["input", "textarea", "select"];
omitformtags=omitformtags.join("|");
function disableselect(e){
	if (omitformtags.indexOf(e.target.tagName.toLowerCase())==-1)
		return false;
}
function reEnable(){
	return true;
}
if (typeof document.onselectstart!="undefined")
	document.onselectstart=new Function ("return false")
else {
	document.onmousedown=disableselect;
	document.onmouseup=reEnable;
}
*/
//drag prevention
(function($){
$.fn.disableSelection = function() {
    return this.each(function() {           
        $(this).attr('unselectable', 'on')
               .css({
                   '-moz-user-select':'none',
                   '-webkit-user-select':'none',
                   'user-select':'none',
                   '-ms-user-select':'none'
               })
               .each(function() {
                   this.onselectstart = function() { return false; };
               });
    });
};

})(jQuery);

