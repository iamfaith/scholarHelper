const request = require("request");
const url = 'https://api.gter.net/xiaoapp_offer:offer.init.json';
let fs = require('fs');
count = 75

function parse(str) {
    let args = [].slice.call(arguments, 1),
        i = 0;

    return str.replace(/%s/g, function () {
        return args[i++];
    });
}

function getGterCsInfos() {
    const ret = []
    for (let i = 1; i <= 75; i++) {
        request.post({
            url: url,
            body: parse('{"session":"uvDDemqnTm5m","page":%s,"pid":"-1","sid":"118"}', i)
        }, (error, response, body) => {
            let json = JSON.parse(body);
            json["data"].forEach(function (item) {
                if (item["professional"].indexOf('Computer') !== -1 && item["degree"].toUpperCase() !== 'BSC') {
                    console.log(item)
                    ret.push(item)

                }
                if (i === 75) {
                    fs.writeFile('gter-carleton.json', JSON.stringify(ret), 'utf8', function () {
                        console.log('success')
                    });
                }
            })
            // console.log(json);
        });
    }
}

function getGterCsDetails() {
    let arr = []
    fs.readFile('gter-carleton.json', {encoding: 'utf-8'}, function (err, data) {
        if (!err) {
            data = JSON.parse(data)
            let count = 0
            for (let d in data) {
                count++
            }
            console.log(count)
            let i = 0
            data.forEach(function (item) {
                request.post({
                    url: 'https://api.gter.net/xiaoapp_offer:show.init.json',
                    body: parse('{"session":"uvDDemqnTm5m","id": "%s"}', item["id"])
                }, (error, response, body) => {
                    try {
                        body = JSON.parse(body)
                        let offer = body["offer_list"]
                        let apply_ret = undefined
                        if (offer.length > 1) {
                            offer.some(function (o) {
                                if (o["schoolname"].toLowerCase().indexOf("carleton") !== -1) {
                                    apply_ret = o["apply_results"]
                                    return true
                                }
                                return false
                            })
                        } else {
                            apply_ret = offer["apply_results"]
                        }

                        let json = body["info"];
                        if (!!json) {
                            arr.push({
                                toefl: json["toefl"],
                                gre: json["gre"],
                                ielts: json["ielts"],
                                gpa: json["undergraduate_gpa"],
                                year: item["year"],
                                ori_sub: json["undergraduate_subject"],
                                apply: apply_ret
                            })
                        }
                    } catch (e) {
                        console.log(item, error)
                    }
                    i++;
                    if (i === count) {
                        arr.sort((a,b) => {
                            if (a.year >= b.year)
                                return 1;
                            else
                                return -1;
                        })
                        fs.writeFile('gter-carleton-details.json', JSON.stringify(arr), 'utf8', function () {
                            console.log('success')
                        });
                    }
                });
                // console.log(item["id"] + "--" + item["year"] + "--" + item["professional"])
            })
        } else {
            console.log(err);
        }
    });
}

getGterCsDetails()