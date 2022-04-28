using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace blazor_samples.Data
{
    public class BoldReportViewerOptions
    {
        public string ReportName { get; set; }
        public string ServiceURL { get; set; }
        public bool HideParameterBlock { get; set; } = false;
    }
    public class BoldReportDesignerOptions
    {
        public string ServiceURL { get; set; }
    }
}
