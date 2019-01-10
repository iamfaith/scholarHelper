let customPanel = function () {
    let panel = document.createElement('div');
    panel.className = 'chrome-plugin-demo-panel';
    panel.innerHTML = `
		<h2>Please input:</h2>
		<div class="btn-area">
            <input id="customInput" />
            <button id="customBtn">search</button>
		</div>
		<div id="my_custom_log">
		</div>
	`;
    document.body.appendChild(panel);
    $('#customBtn').click(function () {
        let kw = $('#customInput').val()
        let ret = $("a[href*='" + kw + "']").filter(function () {
            return this.text.indexOf('@') === -1
        })
        ret.each(function (i, item) {
            i = $.trim(item.text)
            console.log(i, kw)
            $(item.parentNode).append('<button showMore="true" name=' + i + ' >more</button>')
        })
    });

    $('button[showMore="ture"]').on('hover', function () {
        console.log(this.getAttribute('name'))
    })
}


document.addEventListener('DOMContentLoaded', function () {
    customPanel()
})


