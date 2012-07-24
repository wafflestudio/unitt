$(function(){
	init();
	$(window).resize(function(){
		init();
	});

	//수정하기 url 설정
	var split = document.URL.split('/');
	var user_id = split[split.length-1].split('?')[0];
	$('#edit_button').attr('href', "/?user=" + user_id);
});
var gray_color = {border:"#ccc",plane:"#ddd"};

function init()
{
	//토요일 
	var flag = false;
	for (var i=0;i<my_lectures.length;i++){
		if (my_lectures[i].class_time.indexOf('토') != -1) flag = true;
	}
	if (!flag)	$('.sat').hide();
	
	generate_timecell(my_lectures);

	//현재 시간선 설정
	var now = new Date();
	var timeline = $('#current_timeline').width($(window).width()-5);
	var period = now.getHours() - 8;
	var ratio = now.getMinutes() / 60;
	var wday = now.getDay();

	var start_cell = $('[time="'+period+'"]').first();
	var offset = ((start_cell.height()+2)*2) * ratio;

	if (start_cell.size() > 0){
		timeline.css('top', start_cell.position().top + offset).show();
	}
	else {
		timeline.hide();
	}
	$('.today-wday').removeClass('today-wday');
	if (wday == 1) $('.mon').addClass('today-wday');
	if (wday == 2) $('.tue').addClass('today-wday');
	if (wday == 3) $('.wed').addClass('today-wday');
	if (wday == 4) $('.thu').addClass('today-wday');
	if (wday == 5) $('.fri').addClass('today-wday');
	if (wday == 6) $('.sat').addClass('today-wday');
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

			tdiv.attr('course-number', lecture.course_number).attr('lecture-number', lecture.lecture_number);
		}
	}

}

