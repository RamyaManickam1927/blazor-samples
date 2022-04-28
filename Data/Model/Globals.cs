using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace blazor_samples.Data.Model
{
    public class Globals
    {
        public static bool isPhatomJSExist = File.Exists("wwwroot/PhantomJS/phantomjs.exe");
        public static string SERVICE_URL = "api/ReportViewerWebApi";
        public static string DESIGNER_SERVICE_URL = "api/ReportDesignerWebApi";

    }
}
