using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

namespace KeyReflexApp
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string localHtml = Path.Combine(baseDir, "index.html");
                string targetDir = baseDir;

                // If index.html is NOT next to the exe, extract embedded resources to LocalAppData
                if (!File.Exists(localHtml))
                {
                    string appData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                    targetDir = Path.Combine(appData, "KeyReflexStudio", "v1.0.0");
                    Directory.CreateDirectory(targetDir);
                    Directory.CreateDirectory(Path.Combine(targetDir, "js"));

                    ExtractResource("index.html", Path.Combine(targetDir, "index.html"));
                    ExtractResource("styles.css", Path.Combine(targetDir, "styles.css"));
                    ExtractResource("js.app.js", Path.Combine(targetDir, "js", "app.js"));
                    ExtractResource("js.data.js", Path.Combine(targetDir, "js", "data.js"));
                    ExtractResource("js.handRenderer.js", Path.Combine(targetDir, "js", "handRenderer.js"));
                    ExtractResource("js.sound.js", Path.Combine(targetDir, "js", "sound.js"));

                    localHtml = Path.Combine(targetDir, "index.html");
                }

                if (!File.Exists(localHtml))
                {
                    MessageBox.Show("KeyReflex 리소스를 준비하는 중 오류가 발생했습니다:\n" + localHtml, "KeyReflex 오류", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                string fileUrl = new Uri(localHtml).AbsoluteUri;

                // Edge 및 Chrome 독립 App 창 모드 (--app="...") 탐색
                string edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
                if (!File.Exists(edgePath))
                {
                    edgePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
                }

                string chromePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe");
                if (!File.Exists(chromePath))
                {
                    chromePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe");
                }

                ProcessStartInfo psi = new ProcessStartInfo();
                psi.WindowStyle = ProcessWindowStyle.Normal;

                if (File.Exists(edgePath))
                {
                    psi.FileName = edgePath;
                    psi.Arguments = string.Format("--app=\"{0}\" --window-size=1260,940", fileUrl);
                }
                else if (File.Exists(chromePath))
                {
                    psi.FileName = chromePath;
                    psi.Arguments = string.Format("--app=\"{0}\" --window-size=1260,940", fileUrl);
                }
                else
                {
                    psi.FileName = fileUrl;
                    psi.UseShellExecute = true;
                }

                Process.Start(psi);
            }
            catch (Exception ex)
            {
                MessageBox.Show("KeyReflex 실행 중 오류가 발생했습니다:\n" + ex.Message, "KeyReflex 오류", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        static void ExtractResource(string resName, string outPath)
        {
            Assembly asm = Assembly.GetExecutingAssembly();
            using (Stream s = asm.GetManifestResourceStream(resName))
            {
                if (s != null)
                {
                    using (FileStream fs = new FileStream(outPath, FileMode.Create, FileAccess.Write))
                    {
                        s.CopyTo(fs);
                    }
                }
            }
        }
    }
}
