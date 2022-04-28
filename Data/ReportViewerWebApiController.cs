using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BoldReports.Web;
using BoldReports.Web.ReportViewer;
using Microsoft.AspNetCore.Hosting;
using System.Data;
using Microsoft.Extensions.Caching.Memory;
using System.Reflection;
using blazor_samples.Data.Model;
using Samples.Blazor.Logger;


namespace BlazorReportingTools.Data
{
    [Route("api/{controller}/{action}/{id?}")]
    public class ReportViewerWebApiController : ControllerBase, IReportController, IReportLogger
    {
        // Report viewer requires a memory cache to store the information of consecutive client requests and
        // the rendered report viewer in the server.
        private IMemoryCache _cache;

        // IHostingEnvironment used with sample to get the application data from wwwroot.
        private IWebHostEnvironment _hostingEnvironment;

        public ReportViewerWebApiController(IMemoryCache memoryCache, IWebHostEnvironment hostingEnvironment)
        {
            _cache = memoryCache;
            _hostingEnvironment = hostingEnvironment;
        }
        //Get action for getting resources from the report
        [ActionName("GetResource")]
        [AcceptVerbs("GET")]
        // Method will be called from Report Viewer client to get the image src for Image report item.
        public object GetResource(ReportResource resource)
        {
            return ReportHelper.GetResource(resource, this, _cache);
        }

        // Method will be called to initialize the report information to load the report with ReportHelper for processing.
        public void OnInitReportOptions(ReportViewerOptions reportOption)
        {
            reportOption.ReportModel.EmbedImageData = true;
            string basePath = _hostingEnvironment.WebRootPath;
            // Here, we have loaded the sales-order-detail.rdl report from the application folder wwwroot\Resources. sales-order-detail.rdl should be in the wwwroot\Resources application folder.
            System.IO.FileStream reportStream = new System.IO.FileStream(basePath + @"\resources\Report\" + reportOption.ReportModel.ReportPath, System.IO.FileMode.Open, System.IO.FileAccess.Read);
            reportOption.ReportModel.Stream = reportStream;
            if ((dynamic)reportOption.ReportModel.ReportPath.Split('.')[1] == "rdlc")
            {
                reportOption.ReportModel.ProcessingMode = ProcessingMode.Local;
            }
            if (reportOption.ReportModel.ReportPath == "load-large-data.rdlc")
            {
                SqlQuery.getJson(this._cache);
                reportOption.ReportModel.DataSources.Add(new BoldReports.Web.ReportDataSource("SalesOrderDetail", this._cache.Get("SalesOrderDetail") as DataTable));
            }
        }

        // Method will be called when report is loaded internally to start the layout process with ReportHelper.
        public void OnReportLoaded(ReportViewerOptions reportOption)
        {
        }

        [HttpPost]
        public object PostFormReportAction()
        {
            return ReportHelper.ProcessReport(null, this, _cache);
        }

        // Post action to process the report from the server based on json parameters and send the result back to the client.
        [HttpPost]
        public object PostReportAction([FromBody] Dictionary<string, object> jsonArray)
        {
            return ReportHelper.ProcessReport(jsonArray, this, this._cache);
        }
        public void LogError(string message, Exception exception, MethodBase methodType, ErrorType errorType)
        {
            LogExtension.LogError(message, exception, methodType, errorType == ErrorType.Error ? "Error" : "Info");
        }

        public void LogError(string errorCode, string message, Exception exception, string errorDetail, string methodName, string className)
        {
            LogExtension.LogError(message, exception, System.Reflection.MethodBase.GetCurrentMethod(), errorCode + "-" + errorDetail);
        }
        [HttpGet]
        public object GetExternalParameterData()
        {
            var productCategory = SqlQuery.getProductCategory(this._cache);
            var productSubCategory = SqlQuery.getProductSubCategory(this._cache);
            return new { ProductCategoryDetail = productCategory, ProductSubCategoryDetail = productSubCategory };
        }
    }

}