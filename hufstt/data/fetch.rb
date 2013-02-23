#coding : utf-8
require 'net/http'
require 'uri'
require 'nokogiri'

if ARGV.length != 2 then
	puts "Argument error !"
	puts "usage example : ruby fetch.rb 2012 S"
	exit!
end

$year = ARGV[0]
$semester = ARGV[1]

if !($year.to_i > 2000) then
	puts "First argument should be year"
	exit!
elsif !["1", "2", "S", "W"].include?($semester) then
	puts "Second argument should be in [1, 2, S, W]"
	exit!
end

$semester_map = {
	"1" => "1",
	"S" => "2",
	"2" => "3",
	"W" => "4"
}

def get_htm(options)
	while true
		error = false
		begin
			uri = URI.parse(URI.escape("http://webs.hufs.ac.kr:8989/jsp/HUFS/stu1/stu1_c0_a0_d2.jsp?type=&org_sect=#{options[:sector]}&ledg_year=#{$year}&ledg_sessn=#{$semester_map[$semester]}&campus_sect=#{options[:campus]}&gubun=#{options[:gubun]}&crs_strct_cd=#{options[:major]}&compt_fld_cd=#{options[:liberal]}"))
			html_filename_prefix = "#{Dir.getwd()}/htm/#{$year}_#{$semester}_"
			filename = html_filename_prefix + options[:filename] + ".htm"
			puts filename
			str = Net::HTTP.get(uri).force_encoding("EUC-KR").encode("UTF-8")
			open(filename, "w") {|file|	file.puts str}
		rescue
			puts "error"
			error = true
		end

		if !error then
			break
		end
	end

	return str
end

sector = "A"	#소속(학부..)
campus = "H1"	#H1:서울  H2:글로벌
gubun = "1"		#1:전공/부전공  2:실용외국어/교양
major = "AAQ01_H1"
liberal = "31A_H1"

puts "Fetching htm files...\n"
# 개설영역 ; 학년 ; 학수번호 ; 교과목명 ; 학점 ; 시간 ; 담당교수 ; 강의시간(강의실) ; 정원/현원 ; 전필 ; 팀티칭 ; 사이버 ; 원어강의 ; 비고
#
#학부 ; 서울캠퍼스 ; 전공
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AAQ01_H1",:filename => "undergraduate_seoul_major_EU") #EU전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ALA_H1",:filename => "undergraduate_seoul_major_business_department") #경영학부(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ALAA1_H1",:filename => "undergraduate_seoul_major_business") #경영학전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AEC_H1",:filename => "undergraduate_seoul_major_economy_department") #경제학부(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AECA1_H1",:filename => "undergraduate_seoul_major_economy") #경제학전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ACDB1_H1",:filename => "undergraduate_seoul_major_advertisement") #광고.홍보전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AFF01_H1",:filename => "undergraduate_seoul_major_education") #교육학(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AZAA1_H1",:filename => "undergraduate_seoul_major_exchange_student") #국제방문 교환학생(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AEAA1_H1",:filename => "undergraduate_seoul_major_international_trade") #국제통상학과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AGA_H1",:filename => "undergraduate_seoul_major_international_department") #국제학부(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AGAA1_H1",:filename => "undergraduate_seoul_major_international") #국제학전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AAH01_H1",:filename => "undergraduate_seoul_major_ducth") #네덜란드어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AAD01_H1",:filename => "undergraduate_seoul_major_russian") #노어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AAC01_H1",:filename => "undergraduate_seoul_major_german") #독일어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AFC01_H1",:filename => "undergraduate_seoul_major_german_education") #독일어교육과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ABP01_H1",:filename => "undergraduate_seoul_major_north_east_asia") #동북아전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ABC01_H1",:filename => "undergraduate_seoul_major_indonesia") #말레이.인도네시아어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ABJ01_H1",:filename => "undergraduate_seoul_major_mongol") #몽골어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ANDD2_H1",:filename => "undergraduate_seoul_major_contents") #문화콘텐츠학전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ACD_H1",:filename => "undergraduate_seoul_major_media_communication") #미디어커뮤니케이션학부(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ACCC1_H1",:filename => "undergraduate_seoul_major_broadcasting") #방송.영상전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ADA01_H1",:filename => "undergraduate_seoul_major_law") #법학과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ABF01_H1",:filename => "undergraduate_seoul_major_vietnam") #베트남어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AAP01_H1",:filename => "undergraduate_seoul_major_brics") #브릭스전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ANDB2_H1",:filename => "undergraduate_seoul_major_history") #사학과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ACFA1_H1",:filename => "undergraduate_seoul_major_social_science") #사회과학전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AAI01_H1",:filename => "undergraduate_seoul_major_scandinavian") #스칸디나비아어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AAE01_H1",:filename => "undergraduate_seoul_major_spanish") #스페인어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ABD01_H1",:filename => "undergraduate_seoul_major_arabian") #아랍어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ACCA1_H1",:filename => "undergraduate_seoul_major_press_information") #언론.정보전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ACC_H1",:filename => "undergraduate_seoul_major_press_information_department") #언론정보학부(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ANDC2_H1",:filename => "undergraduate_seoul_major_language_cognition") #언어인지과학과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"A1CB1_H1",:filename => "undergraduate_seoul_major_english_luterature") #영문학과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AFA01_H1",:filename => "undergraduate_seoul_major_english_education") #영어교육과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"A1CC1_H1",:filename => "undergraduate_seoul_major_english_translation") #영어통번역학과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"A1CA1_H1",:filename => "undergraduate_seoul_major_english") #영어학과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AFH01_H1",:filename => "undergraduate_seoul_major_korean_as_foreign") #외국어로서의한국어교육연계전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ABI01_H1",:filename => "undergraduate_seoul_major_iranian") #이란어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AAF01_H1",:filename => "undergraduate_seoul_major_italian") #이탈리아어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ABG01_H1",:filename => "undergraduate_seoul_major_indian") #인도어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AJAB1_H1",:filename => "undergraduate_seoul_major_japanese_literature") #일본문학전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AJAA1_H1",:filename => "undergraduate_seoul_major_japanese") #일본어학전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AJAC1_H1",:filename => "undergraduate_seoul_major_japanese_region") #일본지역학전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AJA_H1",:filename => "undergraduate_seoul_major_japan") #일본학부(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ACF_H1",:filename => "undergraduate_seoul_major_freedom") #자유전공학부(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ACBA1_H1",:filename => "undergraduate_seoul_major_political_diplomacy") #정치외교학과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AIAB1_H1",:filename => "undergraduate_seoul_major_chinese_literature") #중국문학전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AIAA1_H1",:filename => "undergraduate_seoul_major_chinese") #중국어학전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AIAC1_H1",:filename => "undergraduate_seoul_major_chinese_region") #중국지역학전공(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AIA_H1",:filename => "undergraduate_seoul_major_china") #중국학부(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ANDA2_H1",:filename => "undergraduate_seoul_major_philosophy") #철학과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ABE01_H1",:filename => "undergraduate_seoul_major_thai") #태국어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ABH11_H1",:filename => "undergraduate_seoul_major_turkish") #터키.아제르바이잔어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AAK01_H1",:filename => "undergraduate_seoul_major_portuguese") #포르투갈(브라질)어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AAB01_H1",:filename => "undergraduate_seoul_major_french") #프랑스어과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AFB01_H1",:filename => "undergraduate_seoul_major_french_education") #프랑스어교육과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"AFD01_H1",:filename => "undergraduate_seoul_major_korean_education") #한국어교육과(서울)
get_htm(:sector => "A",:campus => "H1",:gubun => "1",:major =>"ACBB1_H1",:filename => "undergraduate_seoul_major_administration") #행정학과(서울)

#학부 ; 서울캠퍼스 ; 교양
get_htm(:sector => "A", :campus => "H1", :gubun => "2", :liberal => "31A_H1", :filename => "undergraduate_seoul_liberal_foreign_essential") #실용외국어(필수)(서울)
get_htm(:sector => "A", :campus => "H1", :gubun => "2", :liberal => "31B_H1", :filename => "undergraduate_seoul_liberal_foreign_optional") #실용외국어(선택)(서울)
get_htm(:sector => "A", :campus => "H1", :gubun => "2", :liberal => "320_H1", :filename => "undergraduate_seoul_liberal_portfolio") #학습포트폴리오(서울)
get_htm(:sector => "A", :campus => "H1", :gubun => "2", :liberal => "321_H1", :filename => "undergraduate_seoul_liberal_basic") #기초교양(서울)
get_htm(:sector => "A", :campus => "H1", :gubun => "2", :liberal => "322_H1", :filename => "undergraduate_seoul_liberal_culture") #세계와문화(서울)
get_htm(:sector => "A", :campus => "H1", :gubun => "2", :liberal => "323_H1", :filename => "undergraduate_seoul_liberal_art") #언어.문학.예술(서울)
get_htm(:sector => "A", :campus => "H1", :gubun => "2", :liberal => "324_H1", :filename => "undergraduate_seoul_liberal_history") #역사와철학(서울)
get_htm(:sector => "A", :campus => "H1", :gubun => "2", :liberal => "325_H1", :filename => "undergraduate_seoul_liberal_society") #정보와사회(서울)
get_htm(:sector => "A", :campus => "H1", :gubun => "2", :liberal => "326_H1", :filename => "undergraduate_seoul_liberal_science") #과학과기술(서울)
get_htm(:sector => "A", :campus => "H1", :gubun => "2", :liberal => "327_H1", :filename => "undergraduate_seoul_liberal_health") #건강과레포츠(서울)
get_htm(:sector => "A", :campus => "H1", :gubun => "2", :liberal => "328_H1", :filename => "undergraduate_seoul_liberal_special") #특별교양(서울)
get_htm(:sector => "A", :campus => "H1", :gubun => "2", :liberal => "329_H1", :filename => "undergraduate_seoul_liberal_korean") #한국학(서울)
get_htm(:sector => "A", :campus => "H1", :gubun => "2", :liberal => "61_H1", :filename => "undergraduate_seoul_liberal_army") #군사학(서울)

#대학원 ; 대학원은 전부 서울캠 ; 구분없음
get_htm(:sector => "B", :gubun => "1", :major => "BAAW1_H1", :filename => "graduate_seoul_common_TESOL") #TESOL학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BABP1_H1", :filename => "graduate_seoul_common_business_information") #경영정보학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BABO1_H1", :filename => "graduate_seoul_common_business") #경영학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BABN1_H1", :filename => "graduate_seoul_common_economy") #경제학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BUA01_H1", :filename => "graduate_seoul_common_common") #공통선택과목(전체대상)(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAJ1_H1", :filename => "graduate_seoul_common_korean") #국어국문학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BABP2_H1", :filename => "graduate_seoul_common_international_business") #국제경영학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BABU1_H1", :filename => "graduate_seoul_common_international_relation") #국제관계학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BABM2_H1", :filename => "graduate_seoul_common_international_trade") #국제통상학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAV1_H1", :filename => "graduate_seoul_common_global_cultural_contents") #글로벌문화콘텐츠학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAT1_H1", :filename => "graduate_seoul_common_russian") #노어노문학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAD1_H1", :filename => "graduate_seoul_common_german") #독어독문학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAQ1_H1", :filename => "graduate_seoul_common_south_asian") #동남·남아시아어문학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAO1_H1", :filename => "graduate_seoul_common_east_europian") #동유럽어문학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BACB1_H1", :filename => "graduate_seoul_common_physics") #물리학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BABK1_H1", :filename => "graduate_seoul_common_law") #법학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAB1_H1", :filename => "graduate_seoul_common_french") #불어불문학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BBAL1_H1", :filename => "graduate_seoul_common_comparative_literature") #비교문학과D(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAS1_H1", :filename => "graduate_seoul_common_history") #사학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BADC1_H1", :filename => "graduate_seoul_common_industrial_business") #산업경영공학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BACF1_H1", :filename => "graduate_seoul_common_life_science") #생명공학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BACA1_H1", :filename => "graduate_seoul_common_math") #수학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAE1_H1", :filename => "graduate_seoul_common_spanish") #스페인어문학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BABL1_H1", :filename => "graduate_seoul_common_broadcasting") #신문방송학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAG3_H1", :filename => "graduate_seoul_common_african") #아프리카어문학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAN1_H1", :filename => "graduate_seoul_common_language_cognition") #언어인지과학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAA3_H1", :filename => "graduate_seoul_common_english_literature") #영문학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAA2_H1", :filename => "graduate_seoul_common_english") #영어학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAH1_H1", :filename => "graduate_seoul_common_italian") #이어이문학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAF1_H1", :filename => "graduate_seoul_common_japanese") #일어일문학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BADB1_H1", :filename => "graduate_seoul_common_electronic") #전자정보공학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAU1_H1", :filename => "graduate_seoul_common_information") #정보·기록관리학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BABI1_H1", :filename => "graduate_seoul_common_diplomacy") #정치외교학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAX1_H1", :filename => "graduate_seoul_common_middle_east") #중동어문학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAC1_H1", :filename => "graduate_seoul_common_chinese") #중어중문학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAR1_H1", :filename => "graduate_seoul_common_philosophy") #철학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BADA1_H1", :filename => "graduate_seoul_common_computer") #컴퓨터및정보통신공학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BACD1_H1", :filename => "graduate_seoul_common_statistics") #통계학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BAAK1_H1", :filename => "graduate_seoul_common_portuguese") #포어포문학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BABJ1_H1", :filename => "graduate_seoul_common_administration") #행정학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BACC1_H1", :filename => "graduate_seoul_common_chemistry") #화학과(서울)
get_htm(:sector => "B", :gubun => "1", :major => "BACE1_H1", :filename => "graduate_seoul_common_environment") #환경학과(서울)

#통번역대학원
get_htm(:sector => "D", :gubun => "1", :major => "DUA01_H1", :filename => "translation_seoul_common_common") #공통과목(필수,선택)(서울)
get_htm(:sector => "D", :gubun => "1", :major => "DABD1_H1", :filename => "translation_seoul_common_russian") #한노과(서울)
get_htm(:sector => "D", :gubun => "1", :major => "DABC1_H1", :filename => "translation_seoul_common_german") #한독과(서울)
get_htm(:sector => "D", :gubun => "1", :major => "DABB1_H1", :filename => "translation_seoul_common_french") #한불과(서울)
get_htm(:sector => "D", :gubun => "1", :major => "DABE1_H1", :filename => "translation_seoul_common_spanish") #한서과(서울)
get_htm(:sector => "D", :gubun => "1", :major => "DABH1_H1", :filename => "translation_seoul_common_arabian") #한아과(서울)
get_htm(:sector => "D", :gubun => "1", :major => "DABA1_H1", :filename => "translation_seoul_common_english") #한영과(서울)
get_htm(:sector => "D", :gubun => "1", :major => "DABG1_H1", :filename => "translation_seoul_common_japanese") #한일과(서울)
get_htm(:sector => "D", :gubun => "1", :major => "DABF1_H1", :filename => "translation_seoul_common_chinese") #한중과(서울)

#교육대학원
get_htm(:sector => "E", :gubun =>"1", :major => "EUA01_H1", :filename => "education_seoul_common_common") #공통(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EAAH1_H1", :filename => "education_seoul_common_leadership") #교육경영과 리더십(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EAAD1_H1", :filename => "education_seoul_common_korean") #국어교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EABC1_H1", :filename => "education_seoul_common_multiculture") #다문화교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EAAM1_H1", :filename => "education_seoul_common_russian") #러시아어교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EAAF1_H1", :filename => "education_seoul_common_psychology") #상담심리전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EABA1_H1", :filename => "education_seoul_common_commerce") #상업교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EACD1_H1", :filename => "education_seoul_common_math") #수학교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EAAI1_H1", :filename => "education_seoul_common_spanish") #스페인어교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EAAP1_H1", :filename => "education_seoul_common_children_english") #어린이영어교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EAAK1_H1", :filename => "education_seoul_common_history") #역사교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EAAA1_H1", :filename => "education_seoul_common_english") #영어교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EAAO1_H1", :filename => "education_seoul_common_korean_as_foreign") #외국어로서의 한국어교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EAAN1_H1", :filename => "education_seoul_common_childhood") #유아교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EABB1_H1", :filename => "education_seoul_common_society") #일반사회교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EAAG1_H1", :filename => "education_seoul_common_japanese") #일본어교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EAAL1_H1", :filename => "education_seoul_common_chinese") #중국어교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EAAJ1_H1", :filename => "education_seoul_common_philosophy") #철학교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EACA2_H1", :filename => "education_seoul_common_computer") #컴퓨터교육전공(서울)
get_htm(:sector => "E", :gubun =>"1", :major => "EACC1_H1", :filename => "education_seoul_common_chemistry") #화학교육전공(서울)

#정치행정언론대학원
get_htm(:sector => "G", :gubun => "1", :major => "GAAA1_H1", :filename => "politics_seoul_common_public") #공공정책학과(서울)
get_htm(:sector => "G", :gubun => "1", :major => "GUA01_H1", :filename => "politics_seoul_common_teaching") #교학과(서울)
get_htm(:sector => "G", :gubun => "1", :major => "GAAB2_H1", :filename => "politics_seoul_common_broadcasting") #언론홍보영상학과(서울)
get_htm(:sector => "G", :gubun => "1", :major => "GAAC1_H1", :filename => "politics_seoul_common_diplomacy") #외교안보학과(서울)

#국제지역대학원
get_htm(:sector => "H", :gubun => "1", :major => "HAM01_H1", :filename => "interregion_seoul_common_development") #국제개발학과(서울)
get_htm(:sector => "H", :gubun => "1", :major => "HBC01_H1", :filename => "interregion_seoul_common_relation") #국제관계학과(서울)
get_htm(:sector => "H", :gubun => "1", :major => "HAF02_H1", :filename => "interregion_seoul_common_russia") #러시아·CIS학과(서울)
get_htm(:sector => "H", :gubun => "1", :major => "HAH01_H1", :filename => "interregion_seoul_common_north_america") #북미학과(서울)
get_htm(:sector => "H", :gubun => "1", :major => "HAG01_H1", :filename => "interregion_seoul_common_EU") #유럽연합학과(서울)
get_htm(:sector => "H", :gubun => "1", :major => "HAL01_H1", :filename => "interregion_seoul_common_UN") #유엔평화학과(서울)
get_htm(:sector => "H", :gubun => "1", :major => "HAD02_H1", :filename => "interregion_seoul_common_india") #인도·아세안학과(서울)
get_htm(:sector => "H", :gubun => "1", :major => "HAC01_H1", :filename => "interregion_seoul_common_japan") #일본학과(서울)
get_htm(:sector => "H", :gubun => "1", :major => "HUA05_H1", :filename => "interregion_seoul_common_cross") #전공교차수강과목(서울)
get_htm(:sector => "H", :gubun => "1", :major => "HAB01_H1", :filename => "interregion_seoul_common_china") #중국학과(서울)
get_htm(:sector => "H", :gubun => "1", :major => "HAI01_H1", :filename => "interregion_seoul_common_south_middle_america") #중남미학과(서울)
get_htm(:sector => "H", :gubun => "1", :major => "HAE01_H1", :filename => "interregion_seoul_common_middle_asia") #중동·아프리카학과(서울)
get_htm(:sector => "H", :gubun => "1", :major => "HUA03_H1", :filename => "interregion_seoul_common_regional_language") #지역언어(전공언어)(서울)
get_htm(:sector => "H", :gubun => "1", :major => "HUA04_H1", :filename => "interregion_seoul_common_course_seminar") #진로개발세미나(서울)
get_htm(:sector => "H", :gubun => "1", :major => "HUA01_H1", :filename => "interregion_seoul_common_common") #특강/분과/공통선택(서울)
get_htm(:sector => "H", :gubun => "1", :major => "HAA01_H1", :filename => "interregion_seoul_common_korea") #한국학과(서울)

#경영대학원(주간)
get_htm(:sector => "I", :gubun => "1", :major => "I_H1", :filename => "businessday_seoul_common_businessday") #경영대학원(주간)(서울)

#경영대학원(야간)
get_htm(:sector => "J", :gubun => "1", :major => "JAAA1_H1", :filename => "businessnight_seoul_common_business") #경영학과(서울)
get_htm(:sector => "J", :gubun => "1", :major => "JAAB1_H1", :filename => "businessnight_seoul_common_international_financial") #국제금융학과(서울)

#법학전문대학원
get_htm(:sector => "L", :gubun => "1", :major => "LAAA1_H1", :filename => "lawschool_seoul_common_lawschool") #법학전문대학원(서울)

#TESOL대학원
get_htm(:sector => "M", :gubun => "1", :major => "MAAA1_H1", :filename => "TESOLgraduate_seoul_common_teaching_learning") #교수학습지도학과
get_htm(:sector => "M", :gubun => "1", :major => "MUAA1_H1", :filename => "TESOLgraduate_seoul_common_teaching") #교학과
get_htm(:sector => "M", :gubun => "1", :major => "MAAB1_H1", :filename => "TESOLgraduate_seoul_common_english_contents") #영어교육 콘텐츠개발학과

#TESOL전문교육원
get_htm(:sector => "T", :gubun => "1", :major => "TA_H1", :filename => "TESOLeducation_seoul_common_research") #TESOL 연구과정(서울)(서울)
get_htm(:sector => "T", :gubun => "1", :major => "T_H1", :filename => "TESOLeducation_seoul_common_education") #TESOL 전문교육원(서울)
get_htm(:sector => "T", :gubun => "1", :major => "TAAE1_H1", :filename => "TESOLeducation_seoul_common_241") #TESOL(2+4+1반)(서울)
get_htm(:sector => "T", :gubun => "1", :major => "TAAC1_H1", :filename => "TESOLeducation_seoul_common_weekend") #TESOL(주말반)(서울)
get_htm(:sector => "T", :gubun => "1", :major => "TAAB1_H1", :filename => "TESOLeducation_seoul_common_weekday_night") #TESOL(주중야간반)(서울)
get_htm(:sector => "T", :gubun => "1", :major => "TAAA1_H1", :filename => "TESOLeducation_seoul_common_weekday_morning") #TESOL(주중오전반)(서울)
get_htm(:sector => "T", :gubun => "1", :major => "TAAA2_H1", :filename => "TESOLeducation_seoul_common_wekkday_afternoon") #TESOL(주중오후반)(서울)
get_htm(:sector => "T", :gubun => "1", :major => "TB_H1", :filename => "TESOLeducation_seoul_common_children_research") #어린이 TESOL 연구과정(서울)(서울)
get_htm(:sector => "T", :gubun => "1", :major => "TBAB1_H1", :filename => "TESOLeducation_seoul_common_children_weekend") #어린이 TESOL(주말반)(서울)
get_htm(:sector => "T", :gubun => "1", :major => "TBAA1_H1", :filename => "TESOLeducation_seoul_common_children_night") #어린이 TESOL(주중야간반)(서울)
get_htm(:sector => "T", :gubun => "1", :major => "TBAC1_H1", :filename => "TESOLeducation_seoul_common_children_morning") #어린이 TESOL(주중오전반)(서울)


puts "Fetching htm files is completed!\n"
puts "Start parsing from htm to txt..."

def remove_whitespace(str)
	while true
		new_str = str.gsub(/[ \t\n\b\r]/, "")
		if new_str == str then
			break
		else
			str = new_str
		end
	end
	return str
end

def is_wday(ch)
	return ['월', '화', '수', '목', '금', '토', '일'].include?(ch)
end

def get_class_time_location(str)
	class_times = []
	locations = []
	arr = str.split(/[()]/)
	arr.each_with_index do |x, i|
		if i.even? 
			#x : 월 1 2 3 수 1 2 3
			x2 = x.gsub(/월/, ';월;').gsub(/화/, ';화;').gsub(/수/, ';수;').gsub(/목/, ';목;').gsub(/금/, ';금;').gsub(/토/, ';토;').gsub(/일/, ';일;').split(";")
			x2.delete_at(0)
			x2.each_with_index do |y, j|
				if j.odd?
					#y : 1 2 3
					wday = x2[j-1]
					start_time = y.split(' ')[0]
					duration = y.split(' ').size
					location = arr[i+1]
					class_times.push("#{wday}(#{start_time}-#{duration})")
					locations.push(location)
				end
			end
		end
	end
	return {
		class_time: class_times.join('/'),
		location: locations.join('/')
	}
end

def get_location(str)
	return str.split("(")[1].split(")")[0]
end

def get_sector_text(sector)
	return "학부" if sector == "undergraduate"
	return "대학원" if sector == "graduate"
	return "통번역대학원" if sector == "translation"
	return "교육대학원" if sector == "education"
	return "정치행정언론대학원" if sector == "politics"
	return "국제지역대학원" if sector == "interregion"
	return "경영대학원(주간)" if sector == "businessday"
	return "경영대학원(야간)" if sector == "businessnight"
	return "법학전문대학원" if sector == "lawschool"
	return "TESOL대학원" if sector == "TESOLgraduate"
	return "TESOL전문교육원" if sector == "TESOLeducation"
	return "error"
end

def get_sector_char(filename)
	str = filename.split("/")[1].gsub(/\.htm/, "")
	div = str.split("_")
	sector = div[2]
	return "A" if sector == "undergraduate"
	return "B" if sector == "graduate"
	return "D" if sector == "translation"
	return "E" if sector == "education"
	return "G" if sector == "politics"
	return "H" if sector == "interregion"
	return "I" if sector == "businessday"
	return "J" if sector == "businessnight"
	return "L" if sector == "lawschool"
	return "M" if sector == "TESOLgraduate"
	return "T" if sector == "TESOLeducation"
	return "error"
end

def get_sector(filename)
	str = filename.split("/")[1].gsub(/\.htm/, "")
	div = str.split("_")
	sector = div[2]

	return get_sector_text(sector)
end

def get_department(filename)
	def get_department_text(sector, str)
		#학부
		if sector == "undergraduate" then
			#전공
			return "EU전공" if str == "EU"
			return "경영학부" if str == "business_department"
			return "경영학전공" if str == "business" 
			return "경제학부" if str =="economy_department"
			return "경제학전공" if str == "economy"
			return "광고.홍보전공" if str == "advertisement"
			return "교육학" if str == "education"
			return "국제방문 교환학생" if str == "exchange_student"
			return "국제통상학과" if str == "international_trade"
			return "국제학부" if str == "international_department"
			return "국제학전공" if str == "international"
			return "네덜란드어과" if str == "ducth"
			return "노어과" if str == "russian"
			return "독일어과" if str == "german"
			return "독일어교육과" if str == "german_education"
			return "동북아전공" if str == "north_east_asia"
			return "말레이.인도네이사어과" if str == "indonesia"
			return "몽골어과" if str == "mongol"
			return "문화콘텐츠학전공" if str == "contents"
			return "미디어커뮤니케이션학부" if str == "media_communication"
			return "방송.영상전공" if str == "broadcasting"
			return "법학과" if str == "law"
			return "베트남어과" if str == "vietnam"
			return "브릭스전공" if str == "brics"
			return "사학과" if str == "history"
			return "사회과학전공" if str == "social_science"
			return "스칸디나비아어과" if str == "scandinavian"
			return "스페인어과" if str == "spanish"
			return "아랍어과" if str == "arabian"
			return "언론.정보전공" if str == "press_information"
			return "언론정보학부" if str == "press_information_department"
			return "언어인지과학과" if str == "language_cognition"
			return "영문학과" if str == "english_luterature"
			return "영어교육과" if str == "english_education"
			return "영어통번역학과" if str == "english_translation"
			return "영어학과" if str == "english"
			return "외국어로서의한국어교육연계전공" if str == "korean_as_foreign"
			return "이란어과" if str == "iranian"
			return "이탈리아어과" if str == "italian"
			return "인도어과" if str == "indian"
			return "일본문학전공" if str == "japanese_literature"
			return "일본어학전공" if str == "japanese"
			return "일본지역학전공" if str == "japanese_region"
			return "일본학부" if str == "japan"
			return "자유전공학부" if str == "freedom"
			return "정치외교학과" if str == "political_diplomacy"
			return "중국문학전공" if str == "chinese_literature"
			return "중국어학전공" if str == "chinese"
			return "중국지역학전공" if str == "chinese_region"
			return "중국학부" if str == "china"
			return "철학과" if str == "philosophy"
			return "태국어과" if str == "thai"
			return "터키.아제르바이잔어과" if str == "turkish"
			return "포르투갈(브라질)어과" if str == "portuguese"
			return "프랑스어과" if str == "french"
			return "프랑스어교육과" if str == "french_education"
			return "한국어교육과" if str == "korean_education"
			return "행정학과" if str == "administration"
			#교양,실용외국어
			return "실용외국어(필수)" if str == "foreign_essential"
			return "실용외국어(선택)" if str == "foreign_optional"
			return "학습포트폴리오" if str == "portfolio"
			return "기초교양" if str == "basic"
			return "세계와문화" if str == "culture"
			return "언어.문학.예술" if str == "art"
			return "역사와철학" if str == "history"
			return "정보와사회" if str == "society"
			return "과학과기술" if str == "science"
			return "건강과레포츠" if str == "health"
			return "특별교양" if str == "special"
			return "한국학" if str == "korean"
			return "군사학" if str == "army"
		#대학원
		elsif sector == "graduate"
			return "TESOL학과" if str == "TESOL"
			return "경영정보학과" if str == "business_information" 
			return "경영학과" if str == "business"
			return "경제학과" if str == "economy"
			return "공통선택과목(전체대상)" if str == "common"
			return "국어국문학과" if str == "korean"
			return "국제경영학과" if str == "international_business"
			return "국제관계학과" if str == "international_relation"
			return "국제통상학과" if str == "international_trade"
			return "글로벌문화콘텐츠학과" if str == "global_cultural_contents"
			return "노어노문학과" if str == "russian"
			return "독어독문학과" if str == "german"
			return "동남·남아시아어문학과" if str == "south_asian"
			return "동유럽어문학과" if str == "east_europian"
			return "물리학과" if str == "physics"
			return "법학과" if str == "law"
			return "불어불문학과" if str == "french"
			return "비교문학과D" if str == "comparative_literature"
			return "사학과" if str == "history"
			return "산업경영공학과" if str == "industrial_business"
			return "생명공학과" if str == "life_science"
			return "수학과" if str == "math"
			return "스페인어문학과" if str == "spanish"
			return "신문방송학과" if str == "broadcasting"
			return "아프리카어문학과" if str == "african"
			return "언어인지과학과" if str == "language_cognition"
			return "영문학과" if str == "english_literature"
			return "영어학과" if str == "english"
			return "이어이문학과" if str == "italian"
			return "일어일문학과" if str == "japanese"
			return "전자정보공학과" if str == "electronic"
			return "정보·기록관리학과" if str == "information"
			return "정치외교학과" if str == "diplomacy"
			return "중동어문학과" if str == "middle_east"
			return "중어중문학과" if str == "chinese"
			return "철학과" if str == "philosophy"
			return "컴퓨터및정보통신공학과" if str == "computer"
			return "통계학과" if str == "statistics"
			return "포어포문학과" if str == "portuguese"
			return "행정학과" if str == "administration"
			return "화학과" if str == "chemistry"
			return "환경학과" if str == "environment"
		#통번역대학원
		elsif sector == "translation" then
			return "공통과목(필수,선택)" if str == "common"
			return "한노과" if str == "russian"
			return "한독과" if str == "german"
			return "한불과" if str == "french"
			return "한서과" if str == "spanish"
			return "한아과" if str == "arabian"
			return "한영과" if str == "english"
			return "한일과" if str == "japanese"
			return "한중과" if str == "chinese"
		#교육대학원
		elsif sector == "education"
			return "공통" if str == "common"
			return "교육경영과 리더십" if str == "leadership"
			return "국어교육전공" if str == "korean"
			return "다문화교육전공" if str =="multiculture" 
			return "러시아어교육전공" if str =="russian" 
			return "상담심리전공" if str =="psychology" 
			return "상업교육전공" if str =="commerce" 
			return "수학교육전공" if str =="math" 
			return "스페인어교육전공" if str =="spanish" 
			return "어린이영어교육전공" if str =="children_english" 
			return "역사교육전공" if str =="history" 
			return "영어교육전공" if str =="english" 
			return "외국어로서의 한국어교육전공" if str =="korean_as_foreign" 
			return "유아교육전공" if str =="childhood" 
			return "일반사회교육전공" if str =="society" 
			return "일본어교육전공" if str =="japanese" 
			return "중국어교육전공" if str =="chinese" 
			return "철학교육전공" if str =="philosophy" 
			return "컴퓨터교육전공" if str =="computer" 
			return "화학교육전공" if str =="chemistry" 
		#정치행정언론대학원
		elsif sector == "politics"
			return "공공정책학과" if str == "public"
			return "교학과" if str == "teaching"
			return "언론홍보영상학과" if str == "broadcasting"
			return "외교안보학과" if str == "diplomacy"
		#국제지역대학원
		elsif sector == "interregion"
			return "국제개발학과" if str == "development" 
			return "국제관계학과" if str == "relation" 
			return "러시아·CIS학과" if str == "russia" 
			return "북미학과" if str == "north_america" 
			return "유럽연합학과" if str == "EU" 
			return "유엔평화학과" if str == "UN" 
			return "인도·아세안학과" if str == "india" 
			return "일본학과" if str == "japan" 
			return "전공교차수강과목" if str == "cross" 
			return "중국학과" if str == "china" 
			return "중남미학과" if str == "south_middle_america" 
			return "중동·아프리카학과" if str == "middle_asia" 
			return "지역언어(전공언어)" if str == "regional_language" 
			return "진로개발세미나" if str == "course_seminar" 
			return "특강/분과/공통선택" if str == "common" 
			return "한국학과" if str == "korea" 
		#경영대학원(주간)
		elsif sector == "businessday"
			return "경영대학원(주간)" if str == "businessday"
		#경영대학원(야간)
		elsif sector == "businessnight"
			return "경영학과" if str == "business"
			return "국제금융학과" if str == "international_financial"
		#법학전문대학원
		elsif sector == "lawschool"
			return "법학전문대학원" if str == "lawschool"
		#TESOL대학원
		elsif sector == "TESOLgraduate"
			return "교수학습지도학과" if str == "teaching_learning"
			return "교학과" if str == "teaching"
			return "영어교육 콘텐츠개발학과" if str == "english_contents"
			#TESOL전문교육원
		elsif sector == "TESOLeducation"
			return "TESOL 연구과정" if str == "research" 
			return "TESOL 전문교육원" if str == "education" 
			return "TESOL(2+4+1반)" if str == "241" 
			return "TESOL(주말반)" if str == "weekend"
			return "TESOL(주중야간반)" if str == "weekday_night"
			return "TESOL(주중오전반)" if str == "weekday_morning"
			return "TESOL(주중오후반)" if str == "wekkday_afternoon"
			return "어린이 TESOL 연구과정" if str == "children_research"
			return "어린이 TESOL(주말반)" if str == "children_weekend"
			return "어린이 TESOL(주중야간반)" if str == "children_night"
			return "어린이 TESOL(주중오전반)" if str == "children_morning"
		end
		return "error"
	end
	str = filename.split("/")[1].gsub(/\.htm/, "")
	div = str.split("_")
	sector = div[2]
	gubun = div[4]
	department = div.slice(5, div.length-5).join("_")

	#str = "#{get_sector_text(sector)} - #{get_department_text(sector, department)}"
	str = "#{get_department_text(sector, department)}"
	return str
end

def get_campus(filename)
	def get_campus_text(str)
		return "서울" if str == "seoul"
		return "글로벌" if str == "global"
		return "error"
	end
	str = filename.split("/")[1].gsub(/\.htm/, "")
	div = str.split("_")
	campus = div[3]
	return get_campus_text(campus)
end

#htm 파일을 txt로 파싱하기
txt_filename="#{Dir.getwd()}/txt/#{$year}_#{$semester}.txt"
open(txt_filename, "w") do |file|
	file.puts "#{$year}/#{$semester}"
	file.puts Time.now.localtime().strftime("%Y-%m-%d %H:%M:%S")
	#소속;캠퍼스;구분(전공/부전공/실용외국어/교양과목);개설영역(기초/이중/전공);학년;학수번호;강좌명;학점;강의시간;장소;교수명;정원;현원;전필;팀티칭;사이버;원어강의;비고
	file.puts "sector_char;sector;campus;department;classification;academic_year;course_number;course_title;credit;class_time;location;instructor;quota;enrollment;essential_major;team_teaching;cyber;native;remark"
	
	htm_filenames = Dir["htm/#{$year}_#{$semester}*.htm"]
	htm_filenames.each_with_index do |htmfile, i|
		puts "(#{i+1}/#{htm_filenames.length}) #{htmfile}"
		page = Nokogiri::HTML(open(htmfile), nil, "UTF-8")
		page.css('tr').each_with_index do |tr, i|
			next if i == 0
			td = tr.css('td')
			sector_char = get_sector_char(htmfile)
			sector = get_sector(htmfile)
			campus = get_campus(htmfile)
			department = get_department(htmfile)
			classification = remove_whitespace(td[1].text)
			academic_year = (remove_whitespace(td[2].text).empty? and sector_char != 'A') ? "대학원" : "#{remove_whitespace(td[2].text)}학년"
			course_number = td[3].text
			course_title = td[5].text
			credit = td[6].text
			@class_time_location = get_class_time_location(td[9].text)
			class_time = remove_whitespace(@class_time_location[:class_time])
			location = remove_whitespace(@class_time_location[:location])
			instructor = td[8].text
			quota = td[10].text.split("/")[1]
			enrollment = td[10].text.split("/")[0]
			essential_major = remove_whitespace(td[11].text).empty? ? '' : '전필'
			team_teaching = remove_whitespace(td[12].text).empty? ? '' : '팀티칭'
			cyber = remove_whitespace(td[13].text).empty? ? '' : '사이버'
			native = remove_whitespace(td[14].text).empty? ? '' : '원어'
			remark = td[15].text

			file.puts "#{sector_char};#{sector};#{campus};#{department};#{classification};#{academic_year};#{course_number};#{course_title};#{credit};#{class_time};#{location};#{instructor};#{quota};#{enrollment};#{essential_major};#{team_teaching};#{cyber};#{native};#{remark}"
		end
	end
end
