 $(function(){ 
        var api_host = "http://schedulizer-api.kyleladd.us/v1";
        //Storage
        var classes_selected = JSON.parse(localStorage.getItem('classes_selected')) || [];
        var favorite_schedules = JSON.parse(localStorage.getItem('favorite_schedules')) || [];
        loadSelections();

        function listContainsDictionaryIndex(list,keyvaluelist){
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
        }

        function loadSelections() {
            var output = "";
            $.each(classes_selected, function(i, course){
                output += "<a href=\"#\" data-value='"+JSON.stringify(course)+"' class=\"a_selection\">"+course.departments.abbreviation+" " + course.courseNumber + " <i class=\"fa fa-times\"></i></a>";
            });
            $("#course_selections").html(output);
        }

        //Get From Endpoint
        $.getJSON(api_host + "/departments/", function(results){
            $.each(results, function(i, department){
                $("#departments").append("<li><a class='a_department' data-value='"+department.id+"'>"+department.abbreviation+"</a></li>");
            });
        })
        .fail(function() {
            $("#departments").html("<li>Unable to load departments.</li>");
        })
        .always(function() {
            $("#departments").removeClass("loader-large");
            $("#departments").removeClass("loader");
        });

        //Interactivity
         $.getJSON(api_host + "/courses/?department_id=1", function(results){
            //remove this later
            $("#dept_class_list").html("");
            $.each(results, function(i, course){
                //Change to just one html output set
                $("#dept_class_list").append("<li><a class='a_course' data-value='"+JSON.stringify(course)+"'>"+course.departments.abbreviation+" " + course.courseNumber +" - " + course.name + "</a></li>");
            });
        })
        .fail(function() {
            $("#dept_class_list").html("<li>Unable to load courses.</li>");
        })
        .always(function() {
            $("#dept_class_list").removeClass("loader-large");
            $("#dept_class_list").removeClass("loader");
        });
        // Department selected - View Department Courses
        $("#departments").on("click", "a.a_department", function (event) {
            event.preventDefault();
            $("#dept_class_list").addClass("loader");
            //Get From Endpoint - Department Courses
            $.getJSON(api_host + "/courses/?department_id="+this.getAttribute('data-value'), function(results){
                //remove this later
                $("#dept_class_list").html("");
                $.each(results, function(i, course){
                    //Change to just one html output set
                    $("#dept_class_list").append("<li><a class='a_course' data-value='"+JSON.stringify(course)+"'>"+course.departments.abbreviation+" " + course.courseNumber +" - " + course.name + "</a></li>");
                });
            })
            .fail(function() {
                $("#dept_class_list").html("<li>Unable to load courses.</li>");
            })
            .always(function() {
                $("#dept_class_list").removeClass("loader-large");
                $("#dept_class_list").removeClass("loader");
            });
        });
        // Course selected - Add Course
        $("#dept_class_list").on("click", "a.a_course", function (event) {
            event.preventDefault();
            //Add Course
            var course = JSON.parse(this.getAttribute('data-value'));
            if (listContainsDictionaryIndex(classes_selected,{id:course.id}) === -1) {
                classes_selected.push(course);
                localStorage.setItem('classes_selected', JSON.stringify(classes_selected));
                //reload selections area
                loadSelections();
            }
        });

         // Remove Course Selections
        $("#course_selections").on("click", "a.a_selection", function (event) {
            event.preventDefault();
            // //Remove Course
            var course = JSON.parse(this.getAttribute('data-value'));
            var index = listContainsDictionaryIndex(classes_selected,{id:course.id});
            if (index != -1) {
                classes_selected.splice(index,1);
                localStorage.setItem('classes_selected', JSON.stringify(classes_selected));
                //reload selections area
                loadSelections();
            }
        });

    });