// The collection: one entry per prompt, one run per model that has answered it.
//
// Adding a run:  public/works/<prompt-id>/<model-id>.html
//                public/covers/<prompt-id>/<model-id>.webp   (1200px wide, 16:10)
//                then add it under that prompt's `runs` below.
// Adding a prompt: prompts/zh/<prompt-id>.md + prompts/en/<prompt-id>.md, then a new entry.
// Adding a model:  add it to MODELS; every prompt without a run shows an empty frame for it.

// color: the model's identifying colour in legends, tabs and filters.
window.MODELS = [
  { id: 'opus-5.5-max', name: 'Claude Opus 5.5 Max', short: 'Opus 5.5', vendor: 'Anthropic', color: '#c8553d' },
  { id: 'gpt-6.2-astra-max', name: 'GPT 6.2 Astra Max', short: 'Astra 6.2', vendor: '', color: '#2f6fb3' },
];

// Layout test only: ?demo=gemini adds a model with no runs, to see three columns.
if (new URLSearchParams(location.search).get('demo') === 'gemini') {
  window.MODELS.push({ id: 'gemini-demo', name: 'Gemini（待定）', short: 'Gemini', vendor: 'Google', color: '#3d8b5a', demo: true });
}

window.PROMPTS = [
  {
    id: 'sky-brick-isles',
    brief: { zh: '积木风空中世界', en: 'Brick-built sky world' },
    runs: {
      'opus-5.5-max': {
        title: { zh: '云端积木群岛', en: 'Sky Brick Isles' },
        medium: { zh: 'WebGL2', en: 'WebGL2' },
        blurb: {
          zh: '一列小火车穿过云层，在四座积木浮岛之间往返。岛上的居民各有各的一天。',
          en: 'A little train threads the clouds between four floating brick islands, each with its own small stories.',
        },
      },
      'gpt-6.2-astra-max': {
        title: { zh: '云海邮班', en: 'Cloudpost Railway' },
        medium: { zh: 'Three.js（WebGL）', en: 'Three.js (WebGL)' },
        blurb: {
          zh: '一列蒸汽小火车在风车岛、邮政总站和灯塔湾三座积木浮岛之间往返，热气球在云间飘过。',
          en: 'A little steam train runs between three brick islands, the windmill, the post office and the lighthouse, while a balloon drifts through the clouds.',
        },
      },
    },
  },
  {
    id: 'lighthouse-painting',
    brief: { zh: '风暴中的灯塔油画', en: 'Lighthouse oil painting' },
    runs: {
      'opus-5.5-max': {
        title: { zh: '风暴中的灯塔', en: 'Lighthouse in a Storm' },
        medium: { zh: 'WebGL2 着色器', en: 'WebGL2 shaders' },
        blurb: {
          zh: '二十五秒里，从打底、起稿到厚涂高光和落款，一笔一笔画完一幅油画。',
          en: 'Twenty-five seconds from primed canvas to signature, painted one stroke at a time.',
        },
      },
      'gpt-6.2-astra-max': {
        title: { zh: '岬角余光', en: 'Cape Afterglow' },
        medium: { zh: 'Canvas 2D', en: 'Canvas 2D' },
        blurb: {
          zh: '二十五秒里，一幅风暴中的灯塔油画从底稿一路画到完成，灯塔的光束扫过翻涌的海面。',
          en: 'In twenty-five seconds a storm-lit lighthouse is painted from underdrawing to finish, its beam sweeping across the heaving sea.',
        },
      },
    },
  },
  {
    id: 'plotter-2',
    brief: { zh: '笔式绘图仪', en: 'Pen plotter' },
    runs: {
      'opus-5.5-max': {
        title: { zh: '2号绘图仪', en: 'Plotter No. 2' },
        medium: { zh: 'Canvas 2D 与合成音效', en: 'Canvas 2D, synthesized sound' },
        blurb: {
          zh: '绘图仪握着蓝色圆珠笔，在白纸上画一幅虚构的山水。每换一张纸，就是一幅新构图。',
          en: 'A pen plotter draws an imaginary landscape in blue ballpoint. Every new sheet is a new composition.',
        },
      },
      'gpt-6.2-astra-max': {
        title: { zh: '2号绘图仪', en: 'Plotter No. 2' },
        medium: { zh: 'Canvas 2D 与合成音效', en: 'Canvas 2D, synthesized sound' },
        blurb: {
          zh: '绘图仪用蓝色圆珠笔在白纸上画出一幅山水，右侧清单逐层记录笔数与里程。',
          en: 'A pen plotter draws a mountain landscape in blue ballpoint while a ledger on the right tallies strokes and distance, layer by layer.',
        },
      },
    },
  },
  {
    id: 'softwell-player',
    brief: { zh: '新拟态音乐播放器', en: 'Neumorphic music player' },
    runs: {
      'opus-5.5-max': {
        title: { zh: '索芙维尔播放器', en: 'Softwell Player' },
        medium: { zh: 'CSS 与 Canvas 2D', en: 'CSS, Canvas 2D' },
        blurb: {
          zh: '整页没有一秒音频，频谱却跟着曲目的节拍起伏。',
          en: 'There is no audio at all, yet the visualizer keeps time with each track.',
        },
      },
      'gpt-6.2-astra-max': {
        title: { zh: '索芙维尔播放器', en: 'Softwell Player' },
        medium: { zh: 'CSS、SVG 与 Canvas 2D', en: 'CSS, SVG, Canvas 2D' },
        blurb: {
          zh: '一台新拟态唱机和一份五首曲目的播放队列，没有声音，频谱却随节拍起伏。',
          en: 'A neumorphic turntable with a five-track queue. There is no sound, yet the spectrum moves with the beat.',
        },
      },
    },
  },
  {
    id: 'solarpunk-city',
    brief: { zh: '太阳朋克城市', en: 'Solarpunk city' },
    runs: {
      'opus-5.5-max': {
        title: { zh: '绿湾城', en: 'Verdant Bay' },
        medium: { zh: 'Canvas 2D 像素画', en: 'Canvas 2D pixel art' },
        blurb: {
          zh: '藤蔓爬满高楼，轻轨与渡船载着人们穿过一天的光线。画面全部由代码逐像素画出。',
          en: 'Vines climb the towers while trams and ferries carry people through the day. Every pixel is drawn in code.',
        },
      },
      'gpt-6.2-astra-max': {
        title: { zh: '潮汐温室', en: 'Tide Greenhouse' },
        medium: { zh: '预绘像素图层与 WebGL', en: 'Pre-painted pixel layers, WebGL' },
        blurb: {
          zh: '一座随潮汐与天光呼吸的海港。黎明、午后和夜晚是三幅预先画好的图层，船、飞艇和行人在其间来往。',
          en: 'A harbour that breathes with the tide. Dawn, afternoon and night are three pre-painted layers, with boats, an airship and people moving across them.',
        },
      },
    },
  },
  {
    id: 'spirograph-studio',
    brief: { zh: '齿轮万花尺', en: 'Geared spirograph' },
    runs: {
      'opus-5.5-max': {
        title: { zh: '万花尺工作室', en: 'Spirograph Studio' },
        medium: { zh: 'SVG 与 Canvas 2D', en: 'SVG, Canvas 2D' },
        blurb: {
          zh: '小齿轮沿着大齿圈滚动，笔尖画出花纹。拖滑杆调齿数和笔孔，换一种墨色叠着画。',
          en: 'A small gear rolls inside a ring and the pen draws a rosette. Drag the sliders, then layer another ink.',
        },
      },
      'gpt-6.2-astra-max': {
        title: { zh: '万花尺工作室', en: 'Spirograph Studio' },
        medium: { zh: 'Canvas 2D', en: 'Canvas 2D' },
        blurb: {
          zh: 'Orbis 第 7 号绘图盘：带刻度的齿圈、可直接输入的参数卡，一层层叠出多色花纹。',
          en: 'Orbis Drawing Plate No. 7: a graduated ring, a parameter card you can type into, and rosettes layered in several inks.',
        },
      },
    },
  },
  {
    id: 'koi-pond',
    brief: { zh: '锦鲤池', en: 'Koi pond' },
    runs: {
      'opus-5.5-max': {
        title: { zh: '锦鲤池', en: 'Koi Pond' },
        medium: { zh: 'Three.js', en: 'Three.js' },
        blurb: {
          zh: '瀑布、睡莲和十几尾花色各异的锦鲤。按下投喂，看它们转身游去抢食。',
          en: 'A waterfall, lily pads and a dozen koi. Press Feed and watch them turn and race for it.',
        },
      },
      'gpt-6.2-astra-max': {
        title: { zh: '听泉池', en: 'Listening Spring Pond' },
        medium: { zh: 'Three.js', en: 'Three.js' },
        blurb: {
          zh: '苔石、枫叶和瀑布围着一池清水，锦鲤在睡莲间游动。点「投喂锦鲤」，看它们聚拢过来。',
          en: 'Mossy rocks, maples and a waterfall frame a clear pond where koi drift among lilies. Press Feed and they gather round.',
        },
      },
    },
  },
];
