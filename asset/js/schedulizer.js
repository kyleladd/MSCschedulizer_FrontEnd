var mscSchedulizer = mscSchedulizer === undefined ? {} : mscSchedulizer;
$.extend(mscSchedulizer, {
    classes_selected: JSON.parse(localStorage.getItem('classes_selected')) || [],
    favorite_schedules: JSON.parse(localStorage.getItem('favorite_schedules')) || [],
    listContainsDictionaryIndex: function(list,keyvaluelist){
        try{
            var numcriterion = 0;
            for (var key in keyvaluelist) {
                numcriterion++;
            }
            for(var i = 0; i < list.length; i++){
                var counter = 0;
                for (var key in keyvaluelist) {
                    if(list[i][key] == keyvaluelist[key]){
                        counter++;
                        if(counter == numcriterion){
                            return i;
                        }
                    }
                }
            }
            return -1;
        }
        catch(err){
            return -1;
        }
    },
    loadSelections: function(){
        var output = "";
        $.each(mscSchedulizer.classes_selected, function(i, course){
            output += "<a href=\"#\" data-value='"+JSON.stringify(course)+"' class=\"a_selection\">"+course.departments.abbreviation+" " + course.courseNumber + " <i class=\"fa fa-times\"></i></a>";
        });
        $(mscSchedulizer.course_selections).html(output);
    },
    getDepartmentCourses: function(department){
        department = typeof department !== 'undefined' ?  department : 1;
        $.getJSON(mscSchedulizer.api_host + "/courses/?department_id=" + department, function(results){
            //remove this later
            var output = "";
            $.each(results, function(i, course){
                //Change to just one html output set
                output += "<li><a class='a_course' data-value='"+JSON.stringify(course)+"'>"+course.departments.abbreviation+" " + course.courseNumber +" - " + course.name + "</a></li>";
            });
            $(mscSchedulizer.department_class_list).html(output);
        })
        .fail(function() {
            $(mscSchedulizer.department_class_list).html("<li>Unable to load courses.</li>");
        })
        .always(function() {
            $(mscSchedulizer.department_class_list).removeClass("loader-large");
            $(mscSchedulizer.department_class_list).removeClass("loader");
        });
    },
    getDepartments:function(){
        $.getJSON(mscSchedulizer.api_host + "/departments/", function(results){
            var output = "";
            $.each(results, function(i, department){
                output += "<li><a class='a_department' data-value='"+department.id+"'>"+department.abbreviation+"</a></li>";
            });
            $(mscSchedulizer.departments).html(output);
        })
        .fail(function() {
            $(mscSchedulizer.departments).html("<li>Unable to load departments.</li>");
        })
        .always(function() {
            $(mscSchedulizer.departments).removeClass("loader-large");
            $(mscSchedulizer.departments).removeClass("loader");
        });
    },
    getSchedules:function(callback){
        // /v1/schedule/?courses[]=343&courses[]=344&courses[]=345&courses[]=121
        var courses_list = "";
        $.each(mscSchedulizer.classes_selected, function(i, course){
            courses_list += "&courses[]=" + course.id;
        });
        courses_list = courses_list.replace('&','?');
        if(courses_list != ""){
            $.getJSON(mscSchedulizer.api_host + "/schedule/" + courses_list, function(schedules){
                return callback(schedules);
            })
            .fail(function() {
                return callback(null);
            });
        }
        else{
            $(mscSchedulizer.schedules).html("No courses selected. <a href=\"select-classes.html\">Click here to select courses</a>.");
        }
    },
    convertDate:function(dayOfWeek){
        var today = new Date();
        var weekDate;
        if(dayOfWeek == "M"){
            weekDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()+1);
        }
        else if(dayOfWeek == "T"){
            weekDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()+2);
        }
        else if(dayOfWeek == "W"){
            weekDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()+3);
        }
        else if(dayOfWeek == "R"){
            weekDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()+4);
        }
        else if(dayOfWeek == "F"){
            weekDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()+5);
        }
    
        return weekDate;
    },
    getMinutesStr:function(strtime){
        strtime = strtime.toString();
        return strtime.substring(strtime.length-2,strtime.length);
    },
    getHourStr:function(strtime){
        strtime = strtime.toString();
        strTime = strtime.substring(0,strtime.length-2);
        while (strTime.toString().length < 2) {
            strTime = "0" + strTime;
        }
        return strTime
    },
    insertString:function(str,insert,index){
        str = str.toString();
        if (index > 0){
            if(index > str.length){
                return str + insert;
            }
            else{
                return str.substring(0, index) + insert + str.substring(index, str.length);
            }
        } 
        else{
            return insert + str;
        }
    },
    timeFormat:function(timestr){
        while (timestr.toString().length < 4) {
            timestr = "0" + timestr;
        }
        timestr = mscSchedulizer.insertString(timestr,":",2);
        return timestr + ":00";
    },
    splitMeetings:function(meeting){
        // Warning, this could get ugly
        var meetups = [];
        if(meeting.monday == 1){
            var m_date = mscSchedulizer.convertDate("M");
            var sd = new Date(m_date.getFullYear(), m_date.getMonth(), m_date.getDate(), 0,0,0,0);
            var ed = new Date(m_date.getFullYear(), m_date.getMonth(), m_date.getDate(), 0,0,0,0);
            var st = sd.getFullYear() + "-" + sd.getMonth()+1 + "-" + sd.getDate() + "T" + mscSchedulizer.getHourStr(meeting.startTime)+":"+mscSchedulizer.getMinutesStr(meeting.startTime);
            var et = ed.getFullYear() + "-" + ed.getMonth()+1 + "-" + ed.getDate() + "T" + mscSchedulizer.getHourStr(meeting.endTime)+":"+mscSchedulizer.getMinutesStr(meeting.endTime);
            meetups.push({startTime: st,endTime: et});
        }
        if(meeting.tuesday == 1){
            var m_date = mscSchedulizer.convertDate("T");
            var sd = new Date(m_date.getFullYear(), m_date.getMonth(), m_date.getDate(), 0,0,0,0);
            var ed = new Date(m_date.getFullYear(), m_date.getMonth(), m_date.getDate(), 0,0,0,0);
            var st = sd.getFullYear() + "-" + sd.getMonth()+1 + "-" + sd.getDate() + "T" + mscSchedulizer.getHourStr(meeting.startTime)+":"+mscSchedulizer.getMinutesStr(meeting.startTime);
            var et = ed.getFullYear() + "-" + ed.getMonth()+1 + "-" + ed.getDate() + "T" + mscSchedulizer.getHourStr(meeting.endTime)+":"+mscSchedulizer.getMinutesStr(meeting.endTime);
            meetups.push({startTime: st,endTime: et});
        }
        if(meeting.wednesday == 1){
            var m_date = mscSchedulizer.convertDate("W");
            var sd = new Date(m_date.getFullYear(), m_date.getMonth(), m_date.getDate(), 0,0,0,0);
            var ed = new Date(m_date.getFullYear(), m_date.getMonth(), m_date.getDate(), 0,0,0,0);
            var st = sd.getFullYear() + "-" + sd.getMonth()+1 + "-" + sd.getDate() + "T" + mscSchedulizer.getHourStr(meeting.startTime)+":"+mscSchedulizer.getMinutesStr(meeting.startTime);
            var et = ed.getFullYear() + "-" + ed.getMonth()+1 + "-" + ed.getDate() + "T" + mscSchedulizer.getHourStr(meeting.endTime)+":"+mscSchedulizer.getMinutesStr(meeting.endTime);
            meetups.push({startTime: st,endTime: et});
        }
        if(meeting.thursday == 1){
            var m_date = mscSchedulizer.convertDate("R");
            var sd = new Date(m_date.getFullYear(), m_date.getMonth(), m_date.getDate(), 0,0,0,0);
            var ed = new Date(m_date.getFullYear(), m_date.getMonth(), m_date.getDate(), 0,0,0,0);
            var st = sd.getFullYear() + "-" + sd.getMonth()+1 + "-" + sd.getDate() + "T" + mscSchedulizer.getHourStr(meeting.startTime)+":"+mscSchedulizer.getMinutesStr(meeting.startTime);
            var et = ed.getFullYear() + "-" + ed.getMonth()+1 + "-" + ed.getDate() + "T" + mscSchedulizer.getHourStr(meeting.endTime)+":"+mscSchedulizer.getMinutesStr(meeting.endTime);
            meetups.push({startTime: st,endTime: et});
        }
        if(meeting.friday == 1){
            var m_date = mscSchedulizer.convertDate("F");
            var sd = new Date(m_date.getFullYear(), m_date.getMonth(), m_date.getDate(), 0,0,0,0);
            var ed = new Date(m_date.getFullYear(), m_date.getMonth(), m_date.getDate(), 0,0,0,0);
            var st = sd.getFullYear() + "-" + sd.getMonth()+1 + "-" + sd.getDate() + "T" + mscSchedulizer.getHourStr(meeting.startTime)+":"+mscSchedulizer.getMinutesStr(meeting.startTime);
            var et = ed.getFullYear() + "-" + ed.getMonth()+1 + "-" + ed.getDate() + "T" + mscSchedulizer.getHourStr(meeting.endTime)+":"+mscSchedulizer.getMinutesStr(meeting.endTime);
            meetups.push({startTime: st,endTime: et});
        }
        return meetups;
    },
    createSchedules:function(schedules){
        if(schedules.length == 0 ){
            $(mscSchedulizer.schedules).html("No schedule combinations");
        }
        else{
            $(mscSchedulizer.schedules).html(schedules.length + " combinations");
            $.each(schedules, function(i, schedule){
                var events = [];
                var earlyStartTime = 2400;
                var lateEndTime = 0;
                $.each(schedule, function(c, course){
                    $.each(course.course_sections, function(s, section){
                        $.each(section.meetings, function(m, meeting){
                            if(meeting.startTime < earlyStartTime){
                                earlyStartTime = meeting.startTime;
                            }
                            if(meeting.endTime > lateEndTime){
                                lateEndTime = meeting.endTime;
                            }
                            //Meeting could be on multiple days, needs to be split into separate events
                            var meetups = mscSchedulizer.splitMeetings(meeting);
                            $.each(meetups, function(u, meetup){
                                events.push({title:course.department.abbreviation + " " + course.courseNumber,start:meetup.startTime,end:meetup.endTime,color: mscSchedulizer.colors[c]});
                            });
                        });
                    });
                });
                $(mscSchedulizer.schedules).append("<div id=\"schedule_" + i + "\"></div>");
                $('#schedule_' + i).fullCalendar({                
                    editable: false,
                    handleWindowResize: true,
                    weekends: false, // Hide weekends
                    defaultView: 'agendaWeek', // Only show week view
                    header: false, // Hide buttons/titles
                    minTime: mscSchedulizer.timeFormat(earlyStartTime), // Start time for the calendar
                    maxTime: mscSchedulizer.timeFormat(lateEndTime), // End time for the calendar
                    columnFormat: {
                        week: 'ddd' // Only show day of the week names
                    },
                    displayEventTime: true,
                    height:'auto',
                    allDayText: 'Online/TBD',
                    events: events
                });
            });
        }
    }
});

$(function(){ 
    mscSchedulizer.loadSelections();
    if(location.pathname.substr(location.pathname.lastIndexOf("/")+1) == "select-classes.html"){
        mscSchedulizer.getDepartments();
        mscSchedulizer.getDepartmentCourses();
    }
    // Department selected - View Department Courses
    $(mscSchedulizer.departments).on("click", "a.a_department", function (event) {
        event.preventDefault();
        $(mscSchedulizer.department_class_list).addClass("loader");
        //Get From Endpoint - Department Courses
        mscSchedulizer.getDepartmentCourses(this.getAttribute('data-value'));
    });
    // Course selected - Add Course
    $(mscSchedulizer.department_class_list).on("click", "a.a_course", function (event) {
        event.preventDefault();
        //Add Course
        var course = JSON.parse(this.getAttribute('data-value'));
        if (mscSchedulizer.listContainsDictionaryIndex(mscSchedulizer.classes_selected,{id:course.id}) === -1) {
            mscSchedulizer.classes_selected.push(course);
            localStorage.setItem('classes_selected', JSON.stringify(mscSchedulizer.classes_selected));
            //reload selections area
            mscSchedulizer.loadSelections();
        }
    });

     // Remove Course Selections
    $(mscSchedulizer.course_selections).on("click", "a.a_selection", function (event) {
        event.preventDefault();
        // //Remove Course
        var course = JSON.parse(this.getAttribute('data-value'));
        var index = mscSchedulizer.listContainsDictionaryIndex(mscSchedulizer.classes_selected,{id:course.id});
        if (index != -1) {
            mscSchedulizer.classes_selected.splice(index,1);
            localStorage.setItem('classes_selected', JSON.stringify(mscSchedulizer.classes_selected));
            //reload selections area
            mscSchedulizer.loadSelections();
        }
    });
});