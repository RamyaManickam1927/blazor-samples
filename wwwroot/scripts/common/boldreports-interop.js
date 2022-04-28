var reportName = getReportName();
var isRDLCDesigner = location.pathname.includes('/ReportDesigner/RDLC');
let designerInst;
let isServerReoport;
var flag;

if (location.href.includes('/ExternalParameterReport')) {
    var userAgent = window.navigator.userAgent;
    var isMobile = /mobile/i.test(userAgent);
    var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';
    if (wheelEvent && !isMobile) {
        window.addEventListener(wheelEvent, function () { }, { passive: false });
    }
}

$(function () {
    $.ajax({
        type: "GET",
        contentType: "application/json; charset=utf-8",
        url: 'api/ReportViewerWebApi/GetExternalParameterData',
        success: function (data) {
            $("#startdate").ejDatePicker({ value: new Date("1/1/2003"), width: "180px" });
            $("#enddate").ejDatePicker({ value: new Date("12/31/2003"), width: "180px" });
            var productCategoryList = JSON.parse(data.productCategoryDetail);
            var productSubCategoryList = JSON.parse(data.productSubCategoryDetail);
            $("#category").ejDropDownList({
                dataSource: productCategoryList,
                fields: {
                    text: "Name",
                    value: "ProductCategoryID",
                },
                change: function (args) {
                    $("#checkall").ejCheckBox({ checked: false });
                    var subCategoryDropDownList = productSubCategoryList.filter(({ ProductCategoryID }) => ProductCategoryID == $("#category").ejDropDownList("getSelectedValue"));
                    var subCategoryObj = $('#subcategory').data("ejDropDownList");
                    subCategoryObj.option("dataSource", subCategoryDropDownList);
                },
                selectedIndex: 1,
                width: "180px"
            });
            var subCategoryDropDownList = productSubCategoryList.filter(({ ProductCategoryID }) => ProductCategoryID == 1);
            $("#subcategory").ejDropDownList({
                dataSource: subCategoryDropDownList,
                fields: {
                    text: "Name",
                    value: "ProductSubcategoryID",
                },
                showCheckbox: true,
                change: dropDownCheckAll,
                headerTemplate: "<div id='checkall_wrap' ><input id ='checkall' type='checkbox'/></div>",
                selectedIndex: 1,
                width: "180px",
                watermarkText: "Select Option"
            });
            $("#checkall").ejCheckBox({ text: "Select All", change: selectAllSubCategory });
            $("#update").on("click", function () {
                var reportViewer = $("#report-viewer").boldReportViewer("instance");
                var productCategory = $('#category').ejDropDownList("getSelectedValue");
                var productSubcategory = ($('#subcategory').ejDropDownList("getSelectedValue")).split(",");
                var startDate = $("#startdate").data("ejDatePicker").getValue();
                var endDate = $("#enddate").data("ejDatePicker").getValue();
                var parameters = [{ name: 'ProductCategory', labels: [productCategory], values: [productCategory] }, { name: 'ProductSubcategory', labels: productSubcategory, values: productSubcategory }, { name: 'StartDate', labels: [startDate], values: [startDate] }, { name: 'EndDate', labels: [endDate], values: [endDate] }];
                reportViewer.model.parameters = parameters;
                reportViewer.reload();
            });
        }
    });
});
function selectAllSubCategory(args) {
    if (!flag) {
        var subCategoryObj = $("#subcategory").ejDropDownList("instance");
        if (args.isChecked) subCategoryObj.checkAll();
        else subCategoryObj.uncheckAll();
    }
}
function dropDownCheckAll(args) {
    var subCategoryObj = $("#subcategory").ejDropDownList("instance");
    var instance = $("#checkall").data("ejCheckBox");
    if (!args.isChecked) {
        flag = true;
        instance.setModel({ checked: false });
        flag = false;
    }        
    if (subCategoryObj.getSelectedItem().length == subCategoryObj.getListData().length) {
        $("#checkall").ejCheckBox({ checked: true });
    }
}

function onReportLoaded(args) {
    if (args.model.reportPath.split('.')[1] == 'rdlc' && (args.model.reportPath != 'load-large-data.rdlc')) {
        let reportNameWithoutExt = args.model.reportPath.split(".")[0];
        let reportObj = $('#report-viewer').data("boldReportViewer");
        reportObj.model.dataSources = rdlcData[reportNameWithoutExt];
    }
}

function previewReport(args) {
    if (isServerReoport) {
        let reportPath = args.model.reportPath;
        reportPath = reportPath.indexOf('//') !== -1 ? reportPath.substring(2) : reportPath
        let reportNameWithoutExt = reportPath.split(".rdlc")[0];
        if (reportNameWithoutExt != "load-large-data") {
            datasource = rdlcData[reportNameWithoutExt];
            args.dataSets = datasource;
        }
        args.cancelDataInputDialog = true;
    }
}

function onReportOpened(args) {
    isServerReoport = args.isServerReport;
}

function controlCreate() {
    designerInst = $('#report_designer').data('boldReportDesigner');
    if (typeof reportName !== "undefined") {
        if (reportName.split('.')[1] == 'rdlc') {
            if (reportName == "load-large-data.rdlc") {
                designerInst.setModel({
                    reportType: 'RDLC',
                    previewReport: previewReport,
                    previewOptions: {
                        exportItemClick: window.Globals.EXPORT_ITEM_CLICK,
                        toolbarSettings: {
                            items: ej.ReportViewer.ToolbarItems.All & ~ej.ReportViewer.ToolbarItems.Export & ~ej.ReportViewer.ToolbarItems.Print
                        }
                    }
                });
            }
            else {
                designerInst.setModel({
                    reportType: 'RDLC',
                    previewReport: previewReport,
                    previewOptions: {
                        exportItemClick: window.Globals.EXPORT_ITEM_CLICK
                    }
                });
            }
        }
        else {
            designerInst.setModel({
                previewOptions: {
                    exportItemClick: window.Globals.EXPORT_ITEM_CLICK
                }
            });
        }
        if (reportName) {
            designerInst.openReport(reportName.indexOf("external-parameter-report") !== -1 ? "product-line-sales.rdl" : reportName);
        }
    }
    else if (isRDLCDesigner) {
        designerInst.setModel({
            reportType: 'RDLC'
        });
    }
}

function getReportName() {
    const reportNameRegex = /[\\?&]report-name=([^&#]*)/.exec(location.search);
    return reportNameRegex ? reportNameRegex[1] : undefined;
};

window.addEventListener('beforeunload', () => {
    if (window.Globals.DESTROY_REPORT) {
        destroyReportControls();
    } else {
        window.Globals.DESTROY_REPORT = true;
    }
});

function destroyReportControls() {
    const reportViewerElement = document.querySelector('.e-reportviewer.e-js');
    if (reportViewerElement) { $(reportViewerElement).data('boldReportViewer')._ajaxCallMethod("ClearCache", "_clearCurrentServerCache", false); }
}

// Interop file to render the Bold Report Viewer component with properties.
window.BoldReports = {
    RenderViewer: function (elementID, reportViewerOptions) {
        $("#" + elementID).boldReportViewer({
            reportPath: reportViewerOptions.reportName,
            reportServiceUrl: getBasePath() + reportViewerOptions.serviceURL,
            toolbarSettings: window.Globals.options(reportViewerOptions.reportName),
            toolBarItemClick: window.Globals.EDIT_REPORT,
            exportItemClick: window.Globals.EXPORT_ITEM_CLICK,
            reportLoaded: onReportLoaded,
            parameterSettings: { hideParameterBlock: reportViewerOptions.hideParameterBlock }
        });
    },
    RenderDesigner: function (elementID, reportDesignerOptions) {
        $("#" + elementID).boldReportDesigner({
            serviceUrl: getBasePath() + reportDesignerOptions.serviceURL,
            create: controlCreate,
            reportItemExtensions: [{
                name: 'barcode',
                className: 'EJBarcode',
                imageClass: 'customitem-barcode',
                displayName: '1D Barcode',
                category: 'Barcodes',
                toolTip: {
                    requirements: 'Add a report item to the designer area.',
                    description: 'Display the barcode lines as report item.',
                    title: 'Barcode'
                }
            }, {
                name: 'matrixbarcode',
                className: 'EJQRBarcode',
                imageClass: 'customitem-qrbarcode',
                displayName: '2D Barcode',
                category: 'Barcodes',
                toolTip: {
                    requirements: 'Add a report item to the designer area.',
                    description: 'Display the barcode lines as report item.',
                    title: '2D Barcode'
                }
            }],
            toolbarSettings: {
                items: ej.ReportDesigner.ToolbarItems.All & ~ej.ReportDesigner.ToolbarItems.Save
            },
            ajaxBeforeLoad: window.Globals.onAjaxBeforeLoad,
            reportOpened: onReportOpened,
            toolbarRendering: window.Globals.DESIGNER_TOOLBAR_RENDERING,
            toolbarClick: window.Globals.DESIGNER_TOOLBAR_CLICK
        });
    }
}

window.Globals = {
    options: function (args) {
        if (args == "load-large-data.rdlc") {
            window.Globals.TOOLBAR_OPTIONS.items = ej.ReportViewer.ToolbarItems.All & ~ej.ReportViewer.ToolbarItems.Export & ~ej.ReportViewer.ToolbarItems.Print & ~ej.ReportViewer.ToolbarItems.ExportSetup
        }
        return window.Globals.TOOLBAR_OPTIONS;
    },
    TOOLBAR_OPTIONS: {
        showToolbar: true,
        items: ej.ReportViewer.ToolbarItems.All,
        customGroups: [{
            items: [{
                type: 'Default',
                cssClass: "e-icon e-edit e-reportviewer-icon ej-webicon CustomGroup",
                id: "edit-report",
                // Need to add the proper header and content once, the tool tip issue resolved.
                tooltip: {
                    header: 'Edit Report',
                    content: 'Edit this report in designer'
                }
            }],
            // Need to remove the css (e-reportviewer-toolbarcontainer ul.e-ul:nth-child(4)) once the group index issue resolved
            groupIndex: 3,
            cssClass: "e-show"
        }]
    },
    EDIT_REPORT: function (args) {
        if (args.value == "edit-report") {
            let reportPath = location.href.lastIndexOf('ExternalParameterReport') !== -1 ? 'external-parameter-report' : args.model.reportPath;
            let ReportDesignerPath = reportPath.indexOf('.rdlc') !== -1 ? `${getBasePath()}ReportDesigner/RDLC` : `${getBasePath()}ReportDesigner`;
            window.open(location.origin + ReportDesignerPath + '?report-name=' + reportPath, location.pathname.indexOf('Preview') === -1 ? '_blank' : '_self')

        }
    },
    DESTROY_REPORT: true,
    EXPORT_ITEM_CLICK: function () {
        window.Globals.DESTROY_REPORT = false;
    },
    onAjaxBeforeLoad: function onAjaxBeforeLoad(args) {
        args.data = JSON.stringify({ reportType: isRDLCDesigner === true ? "RDLC" : "RDL" });
    },
    DESIGNER_TOOLBAR_RENDERING: function (args) {
        if ($(args.target).hasClass('e-rptdesigner-toolbarcontainer')) {
            var saveButton = ej.buildTag('li.e-rptdesigner-toolbarli e-designer-toolbar-align e-tooltxt', '', {}, {});
            var saveIcon = ej.buildTag('span.e-rptdesigner-toolbar-icon e-toolbarfonticonbasic e-rptdesigner-toolbar-save e-li-item', '', {}, { title: 'Save' });
            args.target.find('ul:first').append(saveButton.append(saveIcon));
        }
    },
    DESIGNER_TOOLBAR_CLICK: function (args) {
        if (args.click === 'Save') {
            args.cancel = true;
            $('#report_designer').data('boldReportDesigner').saveToDevice();
        }
    }
}