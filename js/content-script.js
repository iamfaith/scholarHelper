let parseRanking = function (data) {
    data = data.substring('noCB('.length, data.length - 1)
    data = JSON.parse(data)
    return data["response"]
}


let customPanel = function () {
    let panel = document.createElement('div');
    panel.className = 'chrome-plugin-demo-panel';
    panel.innerHTML = `
		<h2>Please input:</h2>
		<div class="btn-area">
            <input id="schoolInput" placeholder="input school first"/>
		</div>
		<div class="btn-area">
            <input id="customInput" />
            <button id="customBtn">search</button>
		</div>
		<div id="my_custom_log">
		</div>
	`;
    document.body.appendChild(panel);
    $(document.body).append('<IFRAME id="scholarIfm" class="scholar-bubble"></IFRAME>');
    $('#scholarIfm').hide()

    $('#schoolInput').on('input', function () {
        let kw = $('#schoolInput').val()
        $.get('https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=20&wt=json&json.wrf=noCB&callback=noCB&q=' + kw + '&defType=edismax&bq=schoolname_sort_s%3A%22University+of+Manito%22%5E1000&qf=schoolname_autosuggest&bf=pow(total_number_of_ratings_i%2C1.9)&sort=score+desc&siteName=rmp&rows=20&group=off&group.field=content_type_s&group.limit=20&fq=content_type_s%3ASCHOOL', function (data) {
            let resp = parseRanking(data)["docs"]
            let school = resp.map(item => {
                let id = item["id"].replace("school", "schoolid_s")
                return { label: item['schoolname_s'], value: id }
            })
            $('#schoolInput').autocomplete({
                source: school
            });
            //console.log(school, kw)
        })

    })
    $('#customBtn').click(function () {
        let kw = $('#customInput').val()
        let ret = $("a[href*='" + kw + "']").filter(function () {
            return this.text.indexOf('@') === -1 && this.text.indexOf(',') !== -1
        })
        ret.each(function (i, item) {
            i = $.trim(item.text)
            let parent = $(item.parentNode)
            // $.get("https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=20&wt=json&json.wrf=noCB&callback=noCB&q=" + i + "&defType=edismax&qf=teacherfirstname_t%5E2000+teacherlastname_t%5E2000+teacherfullname_t%5E2000+autosuggest&bf=pow(total_number_of_ratings_i%2C2.1)&sort=total_number_of_ratings_i+desc&siteName=rmp&rows=20&start=0&fl=pk_id+teacherfirstname_t+teacherlastname_t+total_number_of_ratings_i+averageratingscore_rf+schoolid_s&fq=", function (data) {
            $.get("https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=20&wt=json&json.wrf=noCB&callback=noCB&q=" + i + "&qf=teacherfirstname_t%5E2000+teacherlastname_t%5E2000+teacherfullname_t%5E2000+teacherfullname_autosuggest&bf=pow(total_number_of_ratings_i%2C2.1)&sort=score+desc&defType=edismax&siteName=rmp&rows=20&group=off&group.field=content_type_s&group.limit=20&fq=" + $('#schoolInput').val(), function (data) {
                let resp = parseRanking(data)
                console.log(i, resp)
                let rate = "", pkid = ""

                if (resp["numFound"] > 0) {
                    let docs = resp["docs"];
                    pkid = docs[0]["pk_id"]
                    docs = docs.map(item => {
                        return {
                            //"average clarity": item["averageclarityscore_rf"],
                            "难度": item["averageeasyscore_rf"],
                            "有用程度": item["averagehelpfulscore_rf"],
                            "平均热分": item["averagehotscore_rf"],
                            "学生评分": item["averageratingscore_rf"],
                            "标签": item["tag_s_mv"],
                            "评分数": item["total_number_of_ratings_i"],
                        }
                    })
                    // averageclarityscore_rf: 1.85
                    // averageeasyscore_rf: 3.5
                    // averagehelpfulscore_rf: 1.73
                    // averagehotscore_rf: -13
                    // averageratingscore_rf: 1.79
                    //tag_s_mv
                    //total_number_of_ratings_i
                    rate = JSON.stringify(docs)
                } else if (resp["numFound"] > 1) {
                    console.log('多个结果')
                }
                parent.append('<button showMore="true" name="' + i + '" pkid="' + pkid + '">more</button>')
                if (rate !== "")
                    parent.append('<div id="pkid' + pkid + '" style="width: 100%; word-wrap: break-word">' + rate + '</div>')
            })
        })
    });

    $('div').on('click', 'button[showMore="true"]', function (e) {
        e.preventDefault()
        event.stopPropagation();
        event.stopImmediatePropagation();
        let name = this.getAttribute('name'), pkid = this.getAttribute('pkid');
        console.log(e.target, name, pkid)
        // $('#scholarIfm').attr("src", "https://scholar.google.com/citations?view_op=search_authors&mauthors=" + name + "&hl=en&oi=ao")

        // $('#scholarIfm').attr("src", "https://www.ratemyprofessors.com/search.jsp?queryBy=schoolId&schoolName=" + $('#customInput').val() + "&queryoption=TEACHER")

        $('#scholarIfm').attr("src", "https://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + pkid)

        // $('#scholarIfm').attr("src", "https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=20&wt=json&json.wrf=noCB&callback=noCB&q=" + $('#customInput').val() + "&defType=edismax&qf=teacherfirstname_t%5E2000+teacherlastname_t%5E2000+teacherfullname_t%5E2000+autosuggest&bf=pow(total_number_of_ratings_i%2C2.1)&sort=total_number_of_ratings_i+desc&siteName=rmp&rows=20&start=0&fl=pk_id+teacherfirstname_t+teacherlastname_t+total_number_of_ratings_i+averageratingscore_rf+schoolid_s&fq=")
        $('#scholarIfm').toggle('fast');
        let div = document.getElementById('pkid' + pkid);
        if (!div.hasAttribute("hasSearchGoogle"))
            $.get("https://scholar.google.com/citations?hl=en&view_op=search_authors&mauthors=" + name + "&btnG="
                , function (data) {
                    let match;
                    let tags = []
                    while ((match = /<a class="gsc_oai_one_int"([^>]*)>([^<]*)/g.exec(data)) !== null) {
                        for (let i = 0; i < match.length; i++) {
                            if (/^[a-zA-Z ]+$/.test(match[i])) {
                                tags.push(match[i])
                            } else {
                                data = data.replace(match[i], "")
                            }
                        }
                    }
                    match = /<a class="gsc_oai_aff"([^>]*)>([^<]*)/g.exec(data)
                    if (!!match && match.length >= 3)
                        tags.push(match[2])
                    console.log(tags)
                    if (!!div) {
                        div.innerHTML += JSON.stringify(tags);
                    }
                    div.setAttribute("hasSearchGoogle", "true")
                })
    })
}

// %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

var json_objects = new Map()
const itemId = '49302'
var post_data_info = {}

function intersection(o1, o2) {
    // Array.from( myMap.keys() )
    return [ ...o1.keys() ].filter(k => o2.has(k))
}

let loadTable = function () {
    post_data_info = {}

    const sessionKey = $('.singlebutton input[name="sesskey"]')[0].value
    const editorId = $('.singlebutton input[name="id"]')[0].value
    console.log('--', editorId)
    let userRow = $('table tr.userrow')
    let studentInfo = new Map()
    for (let i = 0; i < userRow.length; i++) {
        const studentObj = $(userRow[i])
        const studentNo = studentObj.children('.useridnumber')[0].innerHTML
        const userId = studentObj.attr('data-uid')
        const oldGrade = studentObj.children('td[data-itemid=' + itemId + ']').text()

        studentInfo.set(studentNo, { "studentNo": studentNo, "userid": userId, "itemid": itemId,"grading": oldGrade })
        // console.log(studentNo, userId, oldGrade)
    }
    post_data_info = {'id': editorId, 'sesskey': sessionKey, 'studentInfo': studentInfo}
    console.log('load table', post_data_info)
}

var ExcelToJSON = function () {

    this.parseExcel = function (file) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, {
                type: 'binary'
            });
            workbook.SheetNames.forEach(function (sheetName) {
                var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                // var json_object = JSON.stringify(XL_row_object);
                // json_object = JSON.parse(json_object)

                for (index in XL_row_object) {
                    let obj = XL_row_object[index]
                    if (obj["grading"] != undefined) {
                        const studentNo = obj["ID number"]
                        let studentObj = { "studentNo": studentNo, "studentName": obj["User full name"], "grading": obj["grading"] }

                        if (json_objects.has(studentNo)) {
                            let oldGrade = json_objects.get(studentNo)["grading"]
                            if (oldGrade !=  obj["grading"]) {
                                console.log('-----warning----', "存在" + studentNo, json_objects.get(studentNo), studentObj)
                                if (obj["grading"] > oldGrade) {
                                    json_objects.set(studentNo, studentObj)
                                    console.log('-----覆盖',json_objects.get(studentNo))
                                }
                            }
                        } else {
                            json_objects.set(studentNo, studentObj)
                        }
                        // json_objects.push(studentObj)
                    }
                }
                console.log(json_objects);

                //   jQuery( '#xlx_json' ).val( json_object );
            })
        };

        reader.onerror = function (ex) {
            console.log(ex);
        };

        reader.readAsBinaryString(file);
    };
};

function handleFileSelect(evt) {

    var files = evt.target.files; // FileList object
    var xl2json = new ExcelToJSON();
    xl2json.parseExcel(files[0]);
}


let createForm = function () {
    let form = document.createElement('div');
    form.innerHTML = `
    <div style="z-index: 10000;
    top: 52px;
    position: absolute;">
    <form enctype="multipart/form-data" >
        <input id="uploadFile" type=file  name="files[]">
    </form>
    <button id="clearBtn">clear</button>
    <button id="postBtn">提交</button>
    </div>
    `
    document.body.appendChild(form);
    document.getElementById('uploadFile').addEventListener('change', handleFileSelect, false);
    $('#clearBtn').click(function () {
        console.log('origin', json_objects)
        json_objects = new Map()
        console.log('clear', json_objects)
    });

    $('#postBtn').click(function () {
        console.log('begin to post data')
        
        postKeys = intersection(post_data_info.studentInfo, json_objects)
        console.log(postKeys)
        let cnt = postKeys.length

        for (let i = 0; i < cnt; i++) {
            key = postKeys[i]
            let data = new FormData()
            data.append('id', post_data_info.id)
            data.append('sesskey', post_data_info.sesskey)

            data.append('type', 'value')
            data.append('action', 'update')

            // student 
            const studentObj = post_data_info.studentInfo.get(key)
            const newGrade = json_objects.get(key)["grading"]

            data.append('userid', studentObj['userid'])
            data.append('itemid', studentObj['itemid'])

            if (studentObj['grading'] != '-') {
                console.log('----设置', key, studentObj['grading'], "为", newGrade)
            }
            data.append('newvalue', newGrade)
            console.log('----登记', key, newGrade)
            // console.log(data)

            $.ajax({
                url: 'https://ispace.uic.edu.hk/grade/report/grader/ajax_callbacks.php',
                data: data,
                processData: false,
                contentType: false,
                type: 'POST',
                async: false,
                success: function(data){
                    // console.log('--success')
                },
                error: function(e) {
                    console.log('--error', e)
                }
              });
        }
    });
    
}

document.addEventListener('DOMContentLoaded', function () {
    // if (window.location.hostname.endsWith('.ca')) {
    //     customPanel()
    // }

    console.log("----", window.location.hostname)
    if (window.location.hostname.endsWith('ispace.uic.edu.hk')) {
        loadTable()
        createForm()
    }

})


