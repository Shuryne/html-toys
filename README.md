# HTML Toys：同题

同一段提示词交给不同的模型，每个模型各写成一个单文件 HTML 作品。主页「同题印样」把所有作品排成一张摄影印样：每一行是一道题，每一列是一个模型。点「放大对比」可以把同一道题的作品并排放大，下面附上这段提示词（中英两版）。

## 目录

```
prompts/
  zh/<prompt-id>.md            中文提示词
  en/<prompt-id>.md            英文提示词（内容与中文版一致）
public/                        站点根目录（Cloudflare Pages 输出目录）
  index.html                   主页（同题印样）
  favicon.svg                  网站图标
  og.jpg                       分享预览图，1200×630
  assets/
    toys.js                    作品清单：MODELS 与 PROMPTS
    home.js                    主页共用脚本：语言切换、提示词加载、实时预览
  works/<prompt-id>/<model-id>.html     作品，一个模型一个文件
  covers/<prompt-id>/<model-id>.webp    封面，宽 1200，比例 16:10
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

主页会自动把这件作品放进对应的格子，原来的「未曝光」空帧随之换掉。

新增题目：添加 `prompts/zh` 和 `prompts/en` 下的两份提示词，然后在 `PROMPTS` 里加一项，印样上会多出一行，顺序和 `PROMPTS` 一致。
新增模型：在 `MODELS` 里加一项（`name` 是页面上显示的全名，`short` 是窄屏上的短名，`color` 是它的识别色），印样上会多出一列，还没有它作品的题目显示「未曝光」空帧。

想先看看多一个模型时的版式，可以在地址后面加 `?demo=gemini`，页面会临时多出一个没有作品的「Gemini（待定）」列。

## 本地预览

```bash
sh scripts/dev.sh
```

然后打开 http://localhost:8787 。改了 `assets/` 下的脚本后如果页面没变化，强制刷新一下，浏览器可能还在用缓存。这个脚本会把 `prompts/` 链接到 `public/prompts`，和线上的目录结构保持一致。

## 部署到 Cloudflare Pages

- 构建命令：`cp -r prompts public/prompts`
- 输出目录：`public`

复制 Astra 版空岛邮班到本地时，一并复制同目录下的 `gpt-6.2-astra-max-fallback.mp4`。网页会在 WebGL 不可用时才请求这段备用影片。

分享预览图 `og:image` 现在写的是相对路径，部分平台只认完整网址。绑定域名后，把 `index.html` 里的 `og.jpg` 改成 `https://你的域名/og.jpg`。
