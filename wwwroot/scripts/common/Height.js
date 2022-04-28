$(document).ready(function () {
    if (!location.href.includes('ReportDesigner') && !location.href.includes('Preview')) {
        let style = document.getElementById('reports-style');
        if (!style) {
            style = document.createElement('style');
            style.id = 'reports-style';
            document.body.appendChild(style);
        }
        style.textContent = 'ej-sample { display:block; overflow: hidden; height:' + (window.innerHeight -
            (document.getElementById('parentTabContent').getBoundingClientRect().top - document.body.getBoundingClientRect().top)) + 'px}';
    }
    
})


function resizeViewer() {
    let reportViewerElement = document.querySelector('.e-reportviewer.e-js');
    if (reportViewerElement) $(reportViewerElement).trigger('resize');
}