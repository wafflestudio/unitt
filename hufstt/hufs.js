//Lecture object
//한국외대
function Lecture(options){
	options = options ||{};
	this.sector_char = options["sector_char"];
	this.sector = options["sector"];
	this.campus = options["campus"];
	this.department = options["department"] || "";
	this.classification = options["classification"] || "";
	this.academic_year = options["academic_year"];
	this.course_number = options["course_number"];
	this.course_title = options["course_title"] || "";
	this.credit = options["credit"];
	this.class_time = options["class_time"];
	this.location = options["location"];
	this.instructor = options["instructor"];
	this.quota = options["quota"];
	this.enrollment = options["enrollment"];
	this.remark = options["remark"];
	this.essential_major = options["essential_major"];
	this.team_teaching = options["team_teaching"];
	this.cyber = options["cyber"];
	this.native = options["native"];
}


function sortASC(a, b){return a-b};
function max(arr)
{
	var result = arr[0];
	for (var i=0;i<arr.length;i++){
		if (parseInt(arr[i]) > parseInt(result)) 
			result = arr[i];
	}
	return result;
}

var app = require('http').createServer(handler),
		url = require('url'),
		path = require('path'),
		io = require('socket.io').listen(app),
		fs = require('fs'),
		mime = require('mime'),
		restler = require('restler'),
		querystring = require('querystring'),
		utils = require('./utils.js');

io.set('log level', 1); //reduce log level

//GLOBAL VARIABLES
var coursebook = {}; //{20121:{lectures:[], year:2012, semester:'S', updated_time:"2012-01-01 00:00"}]
var last_coursebook_info = {
	year:2000,
	semester:1,
	updated_time:"2000-01-01 00:00:00"
};
var userdata_cnt = max(fs.readdirSync(__dirname + "/timetable_userdata"));
if (!userdata_cnt) userdata_cnt = 0;

function init_data()
{
	load_data(2012 ,'1'); //1학기
	load_data(2012 ,'S'); //여름학기
	load_data(2012 ,'2'); //2학기

	//timetable_images 폴더가 없으면 생성
	var stats = fs.stat('timetable_images', function(err, stats){
		if (err){
			fs.mkdir('timetable_images');
		}
	});
	//timetable_userdata 폴더가 없으면 생성
	var stats = fs.stat('timetable_userdata', function(err, stats){
		if (err){
			fs.mkdir('timetable_userdata');
		}
	});
}
init_data();

//현재 저장된 수강편람 정보를 리턴
function get_coursebook_info()
{
	var result = [];
	for (hash in coursebook){
		result.push({
			year:coursebook[hash].year,
			semester:coursebook[hash].semester,
			updated_time:coursebook[hash].updated_time
		});
	}
	function semester_to_number(s)
	{
		if (s == '1') return 1;
		if (s == 'S') return 2;
		if (s == '2') return 3;
		if (s == 'W') return 4;
		return 5;
	}
	function sortSemester(a, b)
	{
		var a_s = semester_to_number(a.semester);
		var b_s = semester_to_number(b.semester);
		return a_s - b_s;
	}
	function sortYear(a, b)
	{
		return a.year - b.year;
	}
	result.sort(sortSemester);
	result.sort(sortYear);
	return result.reverse();
}

function load_data(year, semester)
{
	var hash = year + semester;

	var datapath = __dirname + "/data/txt/"+year+"_"+semester+".txt";
	console.log(datapath);
	fs.readFile(datapath, function(err, data){
		if (err){
			console.log('DATA LOAD FAIL : ' + year + "_" + semester);
			return;
		}
		var lines = data.toString().split("\n");
		var lectures = [];
		var year = lines[0].split("/")[0];
		var semester = lines[0].split("/")[1];
		var updated_time = lines[1];
		var header = lines[2].split(";");
		for (var i=3;i<lines.length;i++){
			var line = lines[i];
			var options = {};
			var components = line.split(";");
			for (var j=0;j<components.length;j++){
				options[header[j]] = components[j];
			}
			if (s(options["category"]).indexOf('core') != -1)
				options["classification"] = "핵교";
			lectures.push(new Lecture(options));
		}
		coursebook[hash] = {
			lectures : lectures,
			year : year,
			semester : semester,
			updated_time : updated_time
		};
		if (last_coursebook_info.updated_time < updated_time){
			last_coursebook_info.year = year;
			last_coursebook_info.semester = semester;
			last_coursebook_info.updated_time = updated_time;
		}
		
		console.log('LOAD COMPLETE : ' + year + "_" + semester);
	});
}

var port = process.env.PORT || 3785;
app.listen(port);
console.log("Listening on " + port);

//timetable header & footer
var timetable_header = fs.readFileSync(__dirname + "/timetable_header.htm");
var timetable_footer = fs.readFileSync(__dirname + "/timetable_footer.htm");

function handler (req, res) { //http server handler 
	var uri = url.parse(req.url).pathname; 
	var query = querystring.parse(url.parse(req.url).query);
	var filename = path.join(process.cwd(), uri);
	var user_agent = req.headers['user-agent'];
	var not_support = (/msie 6.0/i.test(user_agent)) || (/msie 7.0/i.test(user_agent));// || (/msie 8.0/i.test(user_agent));

	//supporting browser
	if (uri == "/"){
		//not supporting browser
		if (not_support){
			fs.readFile(__dirname + "/not_support.htm", function(err, data){
				if (err){
					res.writeHead(200);
					return res.end("ERROR");
				}
				res.writeHead(200, {'Content-Type' : mime.lookup(__dirname + "/not_support.htm")});
				res.end(data);
			});
		}
		//저장된 시간표 불러오기 (수정모드)
		else if (query.user) {
			fs.readFile(__dirname + "/timetable_userdata/" + query.user, function(err, content){
				if (err){
					res.writeHead(200);
					res.end("ERROR");
				}
				else {
					res.writeHead(200, {'Content-Type' : "text/html"});
					res.write(timetable_header);
					res.write(content);
					res.end(timetable_footer);
				}
			});
		}
		//시간표 처음부터 작성
		else {
			res.writeHead(200, {'Content-Type' : "text/html"});
			res.write(timetable_header);
			res.end(timetable_footer);
		}
	}
	//저장된 시간표 불러오기 (보기모드)
	else if (uri.indexOf("/user/") == 0){
		var filename = uri.replace("/user/", "");
		fs.readFile(__dirname + "/timetable_userdata/" + filename, function(err, content){
			if (err){
				res.writeHead(200);
				res.end("ERROR");
			}
			else {
				var header = fs.readFileSync(__dirname + "/user_timetable_header.htm");
				var footer = fs.readFileSync(__dirname + "/user_timetable_footer.htm");
				res.writeHead(200, {'Content-Type' : "text/html"});
				res.write(header);
				res.write(content);
				res.end(footer);
			}
		});
	}
	else{
		fs.readFile(__dirname + uri, function(err, data){
			if (err){
				res.writeHead(200);
				return res.end("ERROR");
			}
			//write header
			var filestat = fs.statSync(filename);
			var filemime = mime.lookup(filename);
			res.writeHead(200, {
				'Content-Type' : filemime,
				'Content-Length' : filestat.size
			});
			res.end(data);
		});
	}
}

function s(str)
{
	return str || "";
}

function filter_check(lecture, filter)
{
	if (!filter) return true;
	//학년
	if (filter.academic_year){
		var result = false;
		for (var i=0;i<filter.academic_year.length;i++){
			var academic_year = filter.academic_year[i];
			if (academic_year == "1" && lecture.academic_year == "1학년") result = true;
			if (academic_year == "2" && lecture.academic_year == "2학년") result = true;
			if (academic_year == "3" && lecture.academic_year == "3학년") result = true;
			if (academic_year == "4" && (lecture.academic_year == "4학년" || lecture.academic_year == "5학년")) result = true;
			if (academic_year == "5" && lecture.academic_year == "대학원") result = true;
		}
		if (!result) return false;
	}
	//학점
	if (filter.credit){
		var result = false;
		for (var i=0;i<filter.credit.length;i++){
			var credit = filter.credit[i];
			if (credit == "1" && lecture.credit == "1") result = true;
			if (credit == "2" && lecture.credit == "2") result = true;
			if (credit == "3" && lecture.credit == "3") result = true;
			if (credit == "4" && lecture.credit == "4") result = true;
			if (credit == "5" && parseInt(lecture.credit) >= 5) result = true;
		}
		if (!result) return false;
	}
	//학문의기초, 핵심교양, 기타는 OR 연산
	if (!filter.practical_foreign_language && !filter.liberal_arts && !filter.etc) return true;
	var result = false;
	//실용외국어
	if (filter.practical_foreign_language){
		for (var i=0;i<filter.practical_foreign_language.length;i++){
			var practical = filter.practical_foreign_language[i];
			if (practical == lecture.classification) result = true;
		}
	}
	//교양과목
	if (filter.liberal_arts){
		for (var i=0;i<filter.liberal_arts.length;i++){
			var liberal_arts = filter.liberal_arts[i];
			if (liberal_arts == lecture.classification) result = true;
		}
	}
	//기타
	if (filter.etc){
		for (var i=0;i<filter.etc.length;i++){
			var etc = filter.etc[i];
			if (etc == "teaching" && lecture.classification == "교직") result = true;
		}
	}
	return result;
}

function get_lectures(query)
{
	if (!coursebook[s(query.year) + s(query.semester)])
		return {lectures:[], page:1, per_page:query.per_page, query:query};
	var lectures = coursebook[s(query.year) + s(query.semester)].lectures;
	var page = query.page || 1;
	var per_page = query.per_page || 30;
	var filter = query.filter;
	var result = {lectures:[], page:page, per_page:per_page, query:query};

	//console.log(query);
	//교과목명으로 검색
	if (query.type == "course_title"){
		var title = query.query_text;
		var skip_count = 0;
		for (var i=0;i<lectures.length;i++){
			//if (permutation_inclusion(lectures[i].course_title, title)){
			if (increasing_order_inclusion(lectures[i].course_title, title) && filter_check(lectures[i], filter)){
				if (skip_count < per_page * (page-1))
					skip_count++;
				else{
					result.lectures.push(lectures[i]);
				}
			}
			if (result.lectures.length >= per_page) break;
		}
		return result;
	}
	//교수명으로 검색
	else if (query.type == "instructor"){
		var instructor = query.query_text.replace(/ /g, "").toLowerCase();
		var skip_count = 0;
		for (var i=0;i<lectures.length;i++){
			var lecture_instructor = s(lectures[i].instructor).replace(/ /g, "").toLowerCase();
			if (lecture_instructor.indexOf(instructor) != -1 && filter_check(lectures[i], filter)){
				if (skip_count < per_page * (page-1))
					skip_count++;
				else{
					result.lectures.push(lectures[i]);
				}
			}
			if (result.lectures.length >= per_page) break;
		}
		return result;
	}
	//교과목번호로 검색
	else if (query.type == "course_number"){
		var course_number = query.query_text.replace(/ /g, "").toLowerCase();
		var skip_count = 0;
		for (var i=0;i<lectures.length;i++){
			var lecture_course_number = (s(lectures[i].course_number)+s(lectures[i].lecture_number)).replace(/ /g, "").toLowerCase();
			if (lecture_course_number.indexOf(course_number) != -1 && filter_check(lectures[i], filter)){
				if (skip_count < per_page * (page-1))
					skip_count++;
				else{
					result.lectures.push(lectures[i]);
				}
			}
			if (result.lectures.length >= per_page) break;
		}
		return result;
	}
	//수업교시로 검색
	else if (query.type == "class_time"){
		var class_times = query.query_text.replace(/ /g, "").split(',');
		var skip_count = 0;
		for (var i=0;i<lectures.length;i++){
			var lecture_class_times = s(lectures[i].class_time).split(',');
			//강의시간 사이에 검색시간이 존재하면 추가
			if (class_times_check(lecture_class_times, class_times) && filter_check(lectures[i], filter)){
				if (skip_count < per_page * (page-1))
					skip_count++;
				else{
					result.lectures.push(lectures[i]);
				}
			}
			if (result.lectures.length >= per_page) break;
		}
		return result;
	}
	//개설학과로 검색
	else if (query.type == "department"){
		var department = query.query_text;
		var skip_count = 0;
		for (var i=0;i<lectures.length;i++){
			if (increasing_order_inclusion(lectures[i].department, department) && filter_check(lectures[i], filter)){
				if (skip_count < per_page * (page-1))
					skip_count++;
				else{
					//비고에 개설학과 추가
					/*
					var tmp_lecture = {};
					for (var key in lectures[i])
						tmp_lecture[key] = lectures[i][key];
					tmp_lecture.remark = tmp_lecture.department + "/" + tmp_lecture.remark;
					result.lectures.push(tmp_lecture);
					*/
					result.lectures.push(lectures[i]);
				}
			}
			if (result.lectures.length >= per_page) break;
		}
		return result;
	}
}

//[월3-2, 수3-2], [월3, 화3]
function class_times_check(lecture_class_times, search_class_times)
{
	for (var i=0;i<lecture_class_times.length;i++){
		for (var j=0;j<search_class_times.length;j++){
			if (class_time_check(lecture_class_times[i], search_class_times[j]))
				return true;
		}
	}
	return false;
}

//search_class_time이 lecture_class_time 사이에 존재하는가.
//월3-2, 월4
function class_time_check(lecture_class_time, search_class_time)
{
	if (search_class_time == "") return true;
	var lecture_wday = lecture_class_time[0];
	var lecture_start_time = parseFloat(lecture_class_time.replace(/[()]/g, "").split("-")[0].slice(1));
	var lecture_duration = parseFloat(lecture_class_time.replace(/[()]/g, "").split("-")[1]);
	var search_wday = search_class_time[0];
	var search_time = parseFloat(search_class_time.slice(1));
	if (isNaN(search_time) && search_class_time.length != 1) return false; //입력방식 오류
	if (isNaN(search_time))
		return (lecture_wday == search_wday);

	return (lecture_wday == search_wday && (lecture_start_time <= search_time && search_time < lecture_start_time + lecture_duration));
}

io.sockets.on('connection', function (socket) {
	socket.emit('init_client', {
		message:"Hello world!",
		coursebook_info:get_coursebook_info(),
		last_coursebook_info:last_coursebook_info
	});
	socket.on('search_query', function(data){
		socket.emit('search_result', get_lectures(data));
	});
	socket.on('publish_timetable_to_facebook', function(data){
		upload_timetable_to_facebook(data, socket);
	});
	socket.on('coursebook_update', function(data){
		var password = s(data.password);
		if (password == "snutt!@"){
			console.log("coursebook is updated");
			init_data();
		}
	});
	socket.on('export_timetable', function(data){
		var my_lectures = data.my_lectures;
		var content = "var current_year = '" + data.year + "';\n";
		content = content + "var current_semester = '" + data.semester + "';\n";
		content = content + "var my_lectures = [";
		for (var i=0;i<my_lectures.length;i++){
			content = content + utils.objectToString(my_lectures[i]);
			if (i != my_lectures.length - 1)
				content = content + ",";
		}
		content = content + "];\n";
		userdata_cnt++;
		var filename = userdata_cnt;
		var filepath = __dirname + '/timetable_userdata/' + filename;
		fs.writeFile(filepath, content, function(err){
			if (err){
				console.log("EXPORT ERROR : " + err);
				socket.emit('export_timetable_result', {error:err});
				return;
			}
			socket.emit('export_timetable_result', {filename:filename});
		});
	});
});

//b's elements are members of a's elements with increasing order
function increasing_order_inclusion(a,b)
{
	a = s(a).replace(/ /g, "").toLowerCase();
	b = s(b).replace(/ /g, "").toLowerCase();
	var i=0,j=0;
	while (i<a.length && j<b.length){
		if (a[i] == b[j]) j++;
		else i++;
	}
	return (j == b.length);
}

//b's elements are members of a's elements (a>b)
function permutation_inclusion(a, b)
{
	a = a.replace(/ /g, "").toLowerCase();
	b = b.replace(/ /g, "").toLowerCase();
	for(var i=0;i<b.length;i++){
		var flag = true;
		for (var j=0;j<a.length;j++){
			if (b[i] == a[j]){
				flag = false;
				break;
			}
		}
		if(flag) return false;
	}
	return true;
}

//access_token, base64_data, message
function upload_timetable_to_facebook(options, socket)
{
	var options = options || {};
	var access_token = options.access_token;
	var base64_data = options.base64_data;
	var message = options.message.toString('utf8');
	message = message + "\nhttp://hufstt.kr"

	var filename = __dirname + '/timetable_images/' + String((new Date()).getTime()) + "_" + Math.floor(Math.random() * 10000) + ".png";
	var base64Image = base64_data.toString('base64');
	var decodedImage = new Buffer(base64Image, 'base64');
	fs.writeFile(filename, decodedImage, function(err){
		if (err){
			socket.emit('facebook_publish_complete', {data:{error:"file save error"}});
			console.log(err);
		}else{
			var target_url = 'https://graph.facebook.com/me/photos?message='+encodeURI(message)+'&access_token=' + access_token;
			restler.post(target_url, {
				multipart: true,
				encoding:"utf8",
				data: {
					source: restler.file(filename)
				}
			}).on('complete', function(data) {
				console.log("photo upload complete! : " + filename);
				socket.emit('facebook_publish_complete', {data:JSON.parse(data)});
			});
			
		}
	});
}
