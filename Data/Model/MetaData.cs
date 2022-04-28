using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.AspNetCore.WebUtilities;

namespace blazor_samples.Data.Model
{
    public class MetaData : ComponentBase
    {
        protected override void BuildRenderTree(RenderTreeBuilder builder)
        {
            builder.AddMarkupContent(0, GetContent());
        }

        [Inject]
        protected NavigationManager NavigationManager { get; set; }

        [Inject]
        protected SampleData data { get; set; }

        bool isPreview = false;
        bool isViewer = false;
        bool isDesigner = false;
        bool isWritter = false;
        dynamic currentSample = "";
        dynamic metaData = "";
        dynamic designerReport = "";

        private string GetContent()
        {
            StringBuilder sb = new StringBuilder();
            dynamic currentUrl = NavigationManager.ToBaseRelativePath(NavigationManager.Uri);

            if (currentUrl != "")
            {
                GetInfo(currentUrl);
                var uri = NavigationManager.ToAbsoluteUri(NavigationManager.Uri);
                if (QueryHelpers.ParseQuery(uri.Query).TryGetValue("report-name", out var parm))
                {
                    designerReport = (dynamic)parm[0];
                }
                
            }
            sb.Append(Environment.NewLine);
            sb.Append($"<title>");
            if (isViewer && isPreview)
                sb.Append(currentSample + " | Preview | Blazor Report Viewer");
            else if (isViewer && !isPreview)
                sb.Append(currentSample + " | Blazor Report Viewer | Bold Reports");
            else if (isDesigner && designerReport != "")
            {
                GenerateDesignerParms();
                sb.Append(currentSample + " | Blazor Report Designer");
            }
            else if (isDesigner)
            {
                currentSample = currentUrl.Contains("/RDLC") ? "RDLC" : "RDL";
                sb.Append(currentSample + " | Blazor Report Designer");
            }
            else if (isWritter && isPreview)
            {
                sb.Append("Report Writer | Preview | Blazor Report Writer");
            }
            else if (isWritter)
            {
                sb.Append("Report Writer | Blazor Report Writer | Bold Reports");
            }
            else
            {
                sb.Append("Blazor | Bold Reports");
            }

            sb.Append($"</title>");
            sb.Append(Environment.NewLine);
            sb.Append($"<meta");
            sb.Append($" property =\"og:title\"");
            sb.Append($" content =\"" + currentSample);
            sb.Append("\">");

            sb.Append(Environment.NewLine);
            sb.Append($"<meta");
            sb.Append($" name =\"description\"");
            sb.Append($" content =\"" + metaData);
            sb.Append("\">");
            sb.Append(Environment.NewLine);
            return sb.ToString();
        }

        private void GenerateDesignerParms() {
            designerReport = designerReport.Split('.')[0];
            if (designerReport.Contains('-'))
            {
                string[] split = designerReport.Split('-');
                string str = string.Join(" ", split);
                str = System.Threading.Thread.CurrentThread.CurrentCulture.TextInfo.ToTitleCase(str.ToLower());
                string[] routerPath = str.Split(" ");
                str = "ReportDesigner/" + string.Join("", routerPath);
                GetInfo(str);
            }
            else {
                designerReport = System.Threading.Thread.CurrentThread.CurrentCulture.TextInfo.ToTitleCase(designerReport.ToLower());
                GetInfo("ReportDesigner/" + designerReport);
            }
        }
        private void GetInfo(dynamic url) {
                dynamic info = data.getSampleData().samples;
                isPreview = url.Contains("Preview");
                isDesigner = url.Contains("ReportDesigner");
                isViewer = url.Contains("ReportViewer");
                isWritter = url.Contains("ReportWriter");
            foreach (dynamic sample in info)
            {
                if (url.Contains(sample.routerPath.ToString()))
                {
                    currentSample = sample.sampleName;
                    if (!isDesigner)
                        metaData = sample.metaData.description;
                    else
                        metaData = "The Blazor bold report designer allows the end-users to arrange/customize the reports appearance in browsers.It helps to edit the " + currentSample + " for customer's application needs.";
                    break;
                }
            }
            if (metaData == "") {
                currentSample = url.Contains("/RDLC") ? "RDLC" : "RDL";
                metaData = "The Blazor bold report designer allows the end-users to arrange/customize the reports appearance in browsers.It helps to edit the " + currentSample + " for customer's application needs.";
            }
        }

    }
}
