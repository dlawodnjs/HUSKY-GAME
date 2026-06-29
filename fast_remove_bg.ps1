Add-Type -TypeDefinition @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class FastFloodFill {
    public static void Process(string inPath, string outPath, bool isWhiteBg) {
        Bitmap bmp = new Bitmap(inPath);
        Bitmap outBmp = new Bitmap(bmp.Width, bmp.Height, PixelFormat.Format32bppArgb);
        using (Graphics g = Graphics.FromImage(outBmp)) {
            g.DrawImage(bmp, 0, 0);
        }
        bmp.Dispose();

        int w = outBmp.Width;
        int h = outBmp.Height;

        BitmapData data = outBmp.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
        int stride = data.Stride;
        IntPtr ptr = data.Scan0;
        int bytes = Math.Abs(stride) * h;
        byte[] rgbValues = new byte[bytes];
        Marshal.Copy(ptr, rgbValues, 0, bytes);

        bool[,] visited = new bool[w, h];
        Queue<Point> q = new Queue<Point>();

        for (int i = 0; i < w; i++) {
            q.Enqueue(new Point(i, 0));
            q.Enqueue(new Point(i, h - 1));
        }
        for (int j = 0; j < h; j++) {
            q.Enqueue(new Point(0, j));
            q.Enqueue(new Point(w - 1, j));
        }

        while (q.Count > 0) {
            Point p = q.Dequeue();
            int x = p.X;
            int y = p.Y;

            if (x < 0 || x >= w || y < 0 || y >= h) continue;
            if (visited[x, y]) continue;
            visited[x, y] = true;

            int index = (y * stride) + (x * 4);
            byte b = rgbValues[index];
            byte g = rgbValues[index + 1];
            byte r = rgbValues[index + 2];
            byte a = rgbValues[index + 3];

            if (a == 0) {
                q.Enqueue(new Point(x + 1, y));
                q.Enqueue(new Point(x - 1, y));
                q.Enqueue(new Point(x, y + 1));
                q.Enqueue(new Point(x, y - 1));
                continue;
            }

            bool isBg = false;
            if (isWhiteBg) {
                int dist = Math.Abs(r - 255) + Math.Abs(g - 255) + Math.Abs(b - 255);
                if (dist < 90) isBg = true;
            } else {
                int dist = Math.Abs(r - 0) + Math.Abs(g - 255) + Math.Abs(b - 0);
                if (dist < 150) isBg = true;
            }

            if (isBg) {
                rgbValues[index + 3] = 0; // Alpha
                q.Enqueue(new Point(x + 1, y));
                q.Enqueue(new Point(x - 1, y));
                q.Enqueue(new Point(x, y + 1));
                q.Enqueue(new Point(x, y - 1));
            }
        }

        Marshal.Copy(rgbValues, 0, ptr, bytes);
        outBmp.UnlockBits(data);
        outBmp.Save(outPath, ImageFormat.Png);
        outBmp.Dispose();
        Console.WriteLine("Processed " + outPath);
    }
}
"@ -ReferencedAssemblies System.Drawing

$assetsDir = ".\assets"
[FastFloodFill]::Process("$assetsDir\husky_sprite.jpg", "$assetsDir\husky_sprite_transparent.png", $true)
[FastFloodFill]::Process("$assetsDir\husky_adult.jpg", "$assetsDir\husky_adult_transparent.png", $false)

$srcDir = "..\friendly-goodall\assets"
[FastFloodFill]::Process("$srcDir\husky_happy.png", "$assetsDir\husky_happy.png", $true)
[FastFloodFill]::Process("$srcDir\husky_annoyed.png", "$assetsDir\husky_annoyed.png", $true)
[FastFloodFill]::Process("$srcDir\husky_surprised.png", "$assetsDir\husky_surprised.png", $true)
