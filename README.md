# 网页小品 · HTML Toys

Claude、GPT 等模型创作的互动网页作品集。作品按创作主题展出，悬停封面可播放无声短片，点击可打开完整作品。选择「并排看」可预览同组作品、分别体验交互版，并查看共同的中英文提示词。

## 目录

```
prompts/
  zh/<prompt-id>.md            中文提示词
  en/<prompt-id>.md            英文提示词（内容与中文版一致）
public/                        站点根目录（Cloudflare Pages 输出目录）
  index.html                   主页（网页小品）
  favicon.svg                  网站图标
  og.jpg                       分享预览图，1200×630
  assets/
    toys.js                    作品清单：MODELS 与 PROMPTS
    home.js                    语言、提示词、预览短片及嵌入播放
    gallery.js                 作品墙和对比页交互
  works/<prompt-id>/<model-id>.html     作品，一个模型一个文件
  covers/<prompt-id>/<model-id>.webp    封面，宽 1200，比例 16:10
  covers/<prompt-id>/<model-id>-<w>.webp  可选封面尺寸，宽 384、576 或 864
  previews/<prompt-id>/<model-id>.mp4   可选无声短片，约 4 秒
scripts/prepare-gallery.mjs     按现有资源生成首页的预加载链接及媒体清单
scripts/dev.sh                 本地预览
```

## 命名

- **prompt-id**：英文小写，用连字符连接，按题目内容命名，例如 `solarpunk-city`、`koi-pond`。提示词、作品文件夹和封面文件夹都用这个名字。
- **model-id**：用小写的「模型 版本 档位」，例如 `opus-5.5-max`、`gpt-6.2-astra-max`。页面上显示的名字写在 `toys.js` 的 `MODELS` 里，可以和文件名不同。
- 作品原本的标题（例如「绿湾城」「潮汐温室」）不用改文件名，写在 `toys.js` 里对应 run 的 `title` 中。

## 新增一件作品

1. 把 HTML 文件放到 `public/works/<prompt-id>/<model-id>.html`。
2. 截一张封面，存为 `public/covers/<prompt-id>/<model-id>.webp`。
3. 在 `public/assets/toys.js` 对应题目的 `runs` 里加一项，写上 `title`、`medium` 和 `blurb`，中英各一份。
4. 可加 384、576、864 像素宽的 WebP 封面及一段 432 × 270、无音轨的 H.264 MP4。运行 `node scripts/prepare-gallery.mjs` 刷新媒体清单。

主页会自动更新对应的格子。缺少短片时使用静态封面，缺少缩小版时使用原尺寸封面。

要让新作品嵌入对比页时支持离屏暂停，可在作品脚本前加入现有作品使用的 `parent.Home?.prepareWork(window)` 调用。Canvas 或 WebGL 的分辨率可读取 `window.ToyEmbed?.pixelRatio`。

新增题目：添加 `prompts/zh` 和 `prompts/en` 下的两份提示词，然后在 `PROMPTS` 里加一项。作品组的顺序和 `PROMPTS` 一致。
新增模型：在 `MODELS` 里加一项（`name` 是作品下方的署名，`short` 是聚焦按钮的短名，`color` 是它的识别色）。缺少该模型作品的主题会显示「暂无作品」。

想先看看多一个模型时的版式，可以在地址后面加 `?demo=gemini`，页面会临时加入没有作品的「Gemini（待定）」。

## 本地预览

```bash
sh scripts/dev.sh
```

然后打开 http://localhost:8787 。脚本需要 Node.js 和 Python 3，会更新媒体清单并把 `prompts/` 链接到 `public/prompts`。新增封面或短片后，可单独运行 `node scripts/prepare-gallery.mjs`。

## 部署到 Cloudflare Pages

- 构建命令：`node scripts/prepare-gallery.mjs && cp -r prompts public/prompts`
- 输出目录：`public`

复制 Astra 版空岛邮班到本地时，一并复制同目录下的 `gpt-6.2-astra-max-fallback.mp4`。网页会在 WebGL 不可用时才请求这段备用影片。

分享预览图 `og:image` 现在写的是相对路径，部分平台只认完整网址。绑定域名后，把 `index.html` 里的 `og.jpg` 改成 `https://你的域名/og.jpg`。
