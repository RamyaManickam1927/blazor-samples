using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Hosting;

namespace blazor_samples.Data.Model
{
    public class SampleData
    {
        public dynamic getSampleData()
        {
            string json = System.IO.File.ReadAllText("wwwroot/samples.json");
            dynamic sampleJson = JsonConvert.DeserializeObject(json);
            return sampleJson;
        }
    }
}
