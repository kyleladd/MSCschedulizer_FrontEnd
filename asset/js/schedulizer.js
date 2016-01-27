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
    }
});

$(function(){ 
    mscSchedulizer.loadSelections();
    mscSchedulizer.getDepartments();
    mscSchedulizer.getDepartmentCourses();

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