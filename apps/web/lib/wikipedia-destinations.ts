import { cache } from "react";
import type { Locale } from "@/lib/i18n";

export type DestinationRegionId = "central" | "khangai" | "east" | "gobi" | "ulaanbaatar";

export type LocalizedDestinationPlace = {
  key: string;
  name: string;
  description: string;
  image: string;
  highlights: string[];
  sourceUrl: string;
  sourceLabel: string;
};

export type LocalizedDestinationRegionBase = {
  id: DestinationRegionId;
  image: string;
  places: LocalizedDestinationPlace[];
};

type LocalizedText = Record<Locale, string>;
type LocalizedList = Record<Locale, string[]>;

type PlaceSeed = {
  key: string;
  wikipediaTitle: { en: string } & Partial<Record<Exclude<Locale, "en">, string>>;
  name: LocalizedText;
  description: LocalizedText;
  highlights: LocalizedList;
  fallbackImage: string;
};

type RegionSeed = {
  id: DestinationRegionId;
  places: PlaceSeed[];
};

type WikipediaSummaryPayload = {
  extract?: string;
  originalimage?: { source?: string };
  thumbnail?: { source?: string };
  content_urls?: {
    desktop?: { page?: string };
  };
};

const wikipediaHostByLocale: Record<Locale, string> = {
  mn: "mn",
  en: "en",
  ru: "ru",
  zh: "zh",
};

const wikipediaSourceLabel: LocalizedText = {
  mn: "Wikipedia",
  en: "Wikipedia",
  ru: "Wikipedia",
  zh: "Wikipedia",
};

const regionSeeds: RegionSeed[] = [
  {
    id: "central",
    places: [
      {
        key: "kharkhorin",
        wikipediaTitle: { en: "Kharkhorin", ru: "Хархорин", zh: "哈拉和林" },
        name: { mn: "Хархорин", en: "Kharkhorin", ru: "Хархорин", zh: "哈拉和林" },
        description: {
          mn: "Хархорин нь Чингис хааны эзэнт гүрний нийслэл Хархорумын суурин дээр хөгжсөн хот бөгөөд Монголын төв бүсийн түүхэн аяллын гол зангилаа гэж Wikipedia-д тайлбарлагддаг.",
          en: "Kharkhorin stands near the site of Karakorum, the capital of the Mongol Empire, and remains one of the most important historical stops in central Mongolia according to Wikipedia.",
          ru: "Хархорин расположен рядом с местом древнего Каракорума, столицы Монгольской империи, и считается ключевой исторической точкой центральной Монголии по данным Wikipedia.",
          zh: "根据 Wikipedia，哈拉和林位于蒙古帝国古都哈拉和林遗址附近，是蒙古中部最重要的历史旅行节点之一。",
        },
        highlights: {
          mn: ["Эзэнт гүрний түүх", "Музей, туурь", "Гэр баазын буудал"],
          en: ["Imperial history", "Museum and ruins", "Ger camp stop"],
          ru: ["История империи", "Музей и руины", "Остановка в гер-кэмпе"],
          zh: ["帝国历史", "博物馆与遗址", "蒙古包营地"],
        },
        fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Erdene_Zuu_Monastery.jpg",
      },
      {
        key: "erdene-zuu",
        wikipediaTitle: { en: "Erdene_Zuu_Monastery", ru: "Эрдэни-Дзу", zh: "额尔德尼召寺" },
        name: {
          mn: "Эрдэнэ Зуу хийд",
          en: "Erdene Zuu Monastery",
          ru: "Монастырь Эрдэни-Дзу",
          zh: "额尔德尼召寺",
        },
        description: {
          mn: "Эрдэнэ Зуу хийд нь 16-р зууны Монголын хамгийн эртний буддын хийдүүдийн нэг бөгөөд Хархорумын тууриас авсан чулуугаар баригдсан гэдгээрээ Wikipedia дээр онцлогддог.",
          en: "Erdene Zuu is one of Mongolia's oldest Buddhist monasteries and is noted on Wikipedia for being built with stones from the ruins of Karakorum.",
          ru: "Эрдэни-Дзу считается одним из самых ранних буддийских монастырей Монголии и известен тем, что был построен из камня руин Каракорума, как указано в Wikipedia.",
          zh: "Wikipedia 指出，额尔德尼召寺是蒙古最古老的藏传佛教寺院之一，并以使用哈拉和林遗址石料建造而闻名。",
        },
        highlights: {
          mn: ["16-р зууны хийд", "Буддын архитектур", "Фото зогсоол"],
          en: ["16th-century monastery", "Buddhist architecture", "Photo stop"],
          ru: ["Монастырь XVI века", "Буддийская архитектура", "Фото-стоп"],
          zh: ["16 世纪寺院", "佛教建筑", "摄影点"],
        },
        fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/3/3c/Erdene_Zuu_Monastery.jpg",
      },
      {
        key: "tovkhon",
        wikipediaTitle: { en: "Tovkhon_Monastery", ru: "Төвхөн-хийд", zh: "托布洪寺" },
        name: { mn: "Төвхөн хийд", en: "Tovkhon Monastery", ru: "Товхон-хийд", zh: "托布洪寺" },
        description: {
          mn: "Төвхөн хийд нь Өндөр гэгээн Занабазарын бясалгалын чухал төвүүдийн нэг бөгөөд ой мод, уулын үзэмж хосолсон мөргөл ба явган аяллын цэг гэж Wikipedia-д дурдсан байдаг.",
          en: "Tovkhon Monastery is associated with Zanabazar and is described on Wikipedia as a mountain retreat that blends spiritual heritage with forest hiking landscapes.",
          ru: "Товхон-хийд связан с Дзанабадзаром и в Wikipedia описывается как горная духовная обитель, сочетающая паломничество и лесные прогулки.",
          zh: "Wikipedia 将托布洪寺描述为与札那巴扎尔相关的山中静修地，兼具宗教朝圣与森林徒步体验。",
        },
        highlights: {
          mn: ["Уулын хийд", "Явган аялал", "Сүсэг бишрэлийн маршрут"],
          en: ["Mountain monastery", "Hiking access", "Spiritual route"],
          ru: ["Горный монастырь", "Пеший доступ", "Паломнический маршрут"],
          zh: ["山中古寺", "徒步可达", "朝圣线路"],
        },
        fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/7/71/Tovkhon_Monastery.jpg",
      },
    ],
  },
  {
    id: "khangai",
    places: [
      {
        key: "chuluut",
        wikipediaTitle: { en: "Chuluut_River", ru: "Чулуут-гол", zh: "楚鲁特河" },
        name: { mn: "Чулуутын гол", en: "Chuluut River", ru: "Река Чулуут", zh: "楚鲁特河" },
        description: {
          mn: "Чулуутын гол нь базальт хавцал дундуур урсдаг, галт уулын тогтоц бүхий Хангайн бүсийн хамгийн үзэмжтэй голуудын нэг гэж Wikipedia-д тэмдэглэгдсэн байдаг.",
          en: "Wikipedia describes the Chuluut River as one of the scenic rivers of the Khangai region, flowing through dramatic basalt canyons shaped by volcanic geology.",
          ru: "Wikipedia отмечает реку Чулуут как одну из самых живописных рек Хангайского региона, проходящую через базальтовые каньоны вулканического происхождения.",
          zh: "根据 Wikipedia，楚鲁特河穿过壮观的玄武岩峡谷，是杭爱地区最具代表性的火山地貌河谷之一。",
        },
        highlights: {
          mn: ["Базальт хавцал", "Зургийн цэг", "Байгалийн маршрут"],
          en: ["Basalt canyon", "Photo stop", "Nature route"],
          ru: ["Базальтовый каньон", "Фото-стоп", "Природный маршрут"],
          zh: ["玄武岩峡谷", "摄影点", "自然线路"],
        },
        fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Chuluut_river.jpg",
      },
      {
        key: "terkhiin-tsagaan",
        wikipediaTitle: { en: "Terkhiin_Tsagaan_Lake", ru: "Тэрхийн-Цагаан-Нуур", zh: "特尔欣察干湖" },
        name: {
          mn: "Тэрхийн Цагаан нуур",
          en: "Terkhiin Tsagaan Lake",
          ru: "Озеро Тэрхийн-Цагаан",
          zh: "特尔欣察干湖",
        },
        description: {
          mn: "Тэрхийн Цагаан нуур нь Хорго галт уулын ойролцоох усан толь бөгөөд усан эргийн амралт, шувуу ажиглалт, богино алхалтад тохиромжтой байгалийн цэг гэж Wikipedia-д өгүүлдэг.",
          en: "Terkhiin Tsagaan Lake is presented on Wikipedia as a crater-lake landscape near Khorgo, known for shoreline views, birdlife, and calm nature stays.",
          ru: "Wikipedia описывает озеро Тэрхийн-Цагаан как озерный ландшафт рядом с Хорго, подходящий для отдыха у воды, наблюдения за птицами и спокойного размещения на природе.",
          zh: "Wikipedia 将特尔欣察干湖描述为靠近霍尔果火山的湖泊景观，适合湖畔停留、观鸟与轻松自然体验。",
        },
        highlights: {
          mn: ["Нуурын эрэг", "Шувуу ажиглалт", "Амралтын буудал"],
          en: ["Lakeshore views", "Birdwatching", "Nature stay"],
          ru: ["Берег озера", "Наблюдение за птицами", "Проживание на природе"],
          zh: ["湖岸风景", "观鸟", "自然住宿"],
        },
        fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/9/94/Terkhiin_Tsagaan_lake.jpg",
      },
      {
        key: "khorgo",
        wikipediaTitle: { en: "Khorgo", ru: "Хорго", zh: "霍尔果火山" },
        name: { mn: "Хоргын тогоо", en: "Khorgo Crater", ru: "Кратер Хорго", zh: "霍尔果火山口" },
        description: {
          mn: "Хоргын тогоо нь унтарсан галт уулын тогоо бөгөөд лавын талбай, өндөрлөгөөс харах нуурын үзэмжээрээ Хангайн хамгийн алдартай байгалийн цэгүүдийн нэг гэж Wikipedia мэдээлдэг.",
          en: "Khorgo is an extinct volcanic crater and Wikipedia highlights it for its lava fields, rim trail, and sweeping views over Terkhiin Tsagaan Lake.",
          ru: "Хорго — потухший вулканический кратер, который Wikipedia выделяет за лавовые поля, тропу по кромке и панорамы озера Тэрхийн-Цагаан.",
          zh: "Wikipedia 介绍霍尔果为休眠火山口，以熔岩地貌、环口步道和俯瞰特尔欣察干湖的景观著称。",
        },
        highlights: {
          mn: ["Унтарсан галт уул", "Лавын тогтоц", "Панорам үзэмж"],
          en: ["Extinct volcano", "Lava field", "Panoramic lookout"],
          ru: ["Потухший вулкан", "Лавовое поле", "Панорамная точка"],
          zh: ["休眠火山", "熔岩地貌", "全景观景点"],
        },
        fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Khorgo.jpg",
      },
    ],
  },
  {
    id: "east",
    places: [
      {
        key: "buir-lake",
        wikipediaTitle: { en: "Buir_Lake", ru: "Буир-Нуур", zh: "布尔湖" },
        name: { mn: "Буйр нуур", en: "Buir Lake", ru: "Озеро Буир", zh: "布尔湖" },
        description: {
          mn: "Буйр нуур нь Монгол, Хятадын хил орчмын томоохон нуурын системийн нэг бөгөөд нүүдлийн шувуу, өргөн талын уур амьсгалаараа зүүн бүсийн онцгой байгалийн цэг гэж Wikipedia тайлбарладаг.",
          en: "Wikipedia presents Buir Lake as a large border lake valued for migratory birds, open-steppe scenery, and the calm wetlands of eastern Mongolia.",
          ru: "Wikipedia описывает озеро Буир как крупное приграничное озеро, известное перелетными птицами, спокойными водно-болотными угодьями и степными пейзажами востока Монголии.",
          zh: "Wikipedia 将布尔湖介绍为蒙古东部重要的边境湖泊，以候鸟、湿地与开阔草原景观著称。",
        },
        highlights: {
          mn: ["Хилийн нуур", "Нүүдлийн шувуу", "Тал хээрийн үзэмж"],
          en: ["Border lake", "Migratory birds", "Open steppe views"],
          ru: ["Пограничное озеро", "Перелетные птицы", "Степные панорамы"],
          zh: ["边境湖泊", "候鸟", "草原景观"],
        },
        fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/4/44/Buir_nuur.jpg",
      },
      {
        key: "mongol-daguur",
        wikipediaTitle: { en: "Mongol_Daguur", ru: "Монгол-Дагуур", zh: "蒙古达乌里亚" },
        name: { mn: "Монгол Дагуур", en: "Mongol Daguur", ru: "Монгол-Дагуур", zh: "蒙古达乌里亚" },
        description: {
          mn: "Монгол Дагуур нь Дорнодын тал хээрийн экосистемийг хамгаалдаг дархан бүс бөгөөд ховор шувуу, өргөн уудам өвсөн талыг харуулах биосферийн чухал газар гэж Wikipedia-д тэмдэглэгдсэн байдаг.",
          en: "Wikipedia identifies Mongol Daguur as a protected steppe reserve known for rare birds and one of the finest examples of the Daurian grassland ecosystem.",
          ru: "Wikipedia называет Монгол-Дагуур охраняемой степной территорией, где сохраняются редкие птицы и один из самых ценных участков даурской экосистемы.",
          zh: "Wikipedia 将蒙古达乌里亚列为受保护草原区域，是观察珍稀鸟类和达乌里亚草原生态系统的重要地点。",
        },
        highlights: {
          mn: ["Дархан цаазат газар", "Ховор шувуу", "Биосферийн аялал"],
          en: ["Protected reserve", "Rare birds", "Biosphere route"],
          ru: ["Заповедная территория", "Редкие птицы", "Биосферный маршрут"],
          zh: ["保护区", "珍稀鸟类", "生态路线"],
        },
        fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/e/e7/Mongol_Daguur.jpg",
      },
      {
        key: "kherlen",
        wikipediaTitle: { en: "Kherlen_River", ru: "Керулен", zh: "克鲁伦河" },
        name: { mn: "Хэрлэн гол", en: "Kherlen River", ru: "Река Керулен", zh: "克鲁伦河" },
        description: {
          mn: "Хэрлэн гол нь зүүн Монголын өргөн тал нутгийг дайран урсдаг голуудын нэг бөгөөд нүүдэлчдийн аялал, өргөн хөндийн тайван уур амьсгалтай холбоотойгоор Wikipedia дээр дүрслэгддэг.",
          en: "Wikipedia describes the Kherlen River as one of eastern Mongolia's major rivers, shaping broad valleys and pastoral travel landscapes across the steppe.",
          ru: "Wikipedia описывает Керулен как одну из главных рек восточной Монголии, формирующую широкие долины и спокойные степные пасторальные пейзажи.",
          zh: "Wikipedia 介绍克鲁伦河为蒙古东部重要河流之一，穿过辽阔河谷并塑造典型的草原牧游景观。",
        },
        highlights: {
          mn: ["Өргөн хөндий", "Голын эрэг", "Нүүдэлчдийн маршрут"],
          en: ["Wide valley", "Riverside stop", "Pastoral route"],
          ru: ["Широкая долина", "Речной берег", "Пасторальный маршрут"],
          zh: ["宽阔河谷", "河岸停靠", "草原路线"],
        },
        fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Kherlen_river.jpg",
      },
    ],
  },
  {
    id: "gobi",
    places: [
      {
        key: "tsagaan-suvarga",
        wikipediaTitle: { en: "Tsagaan_Suvarga", ru: "Цагаан-Суварга", zh: "查干苏瓦尔嘎" },
        name: { mn: "Цагаан суварга", en: "Tsagaan Suvarga", ru: "Цагаан-Суварга", zh: "查干苏瓦尔嘎" },
        description: {
          mn: "Цагаан суварга нь олон өнгийн тунамал давхаргаараа алдартай цохио бөгөөд элэгдлээс үүссэн ханан тогтоцтой тул Говийн хамгийн зураг авалттай цэгүүдийн нэг гэж Wikipedia онцолдог.",
          en: "Wikipedia highlights Tsagaan Suvarga for its layered sedimentary cliffs and erosional formations, making it one of the most photographed landscapes in the Gobi.",
          ru: "Wikipedia выделяет Цагаан-Суваргу за многослойные осадочные обрывы и эрозионные формы, благодаря которым место считается одной из самых фотогеничных точек Гоби.",
          zh: "Wikipedia 指出，查干苏瓦尔嘎以层状沉积岩断崖和风化侵蚀地貌闻名，是戈壁最具代表性的摄影地点之一。",
        },
        highlights: {
          mn: ["Өнгөлөг цохио", "Фото экспедиц", "Нар жаргах цэг"],
          en: ["Layered cliffs", "Photo expedition", "Sunset point"],
          ru: ["Слоистые скалы", "Фотоэкспедиция", "Точка заката"],
          zh: ["层状断崖", "摄影路线", "日落点"],
        },
        fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Tsagaan_suvarga.jpg",
      },
      {
        key: "khongoryn-els",
        wikipediaTitle: { en: "Khongoryn_Els", ru: "Хонгорын-Элс", zh: "洪戈尔沙丘" },
        name: { mn: "Хонгорын элс", en: "Khongoryn Els", ru: "Хонгорын Элс", zh: "洪戈尔沙丘" },
        description: {
          mn: "Хонгорын элс нь Говь гурван сайханы үндэсний цогцолборт орших аварга манхан бүс бөгөөд салхинд дуугардаг элсэн ханаараа Wikipedia дээр түгээмэл танигдсан.",
          en: "Khongoryn Els is described on Wikipedia as a giant dune system in Gobi Gurvansaikhan, famous for its singing sands and dramatic desert scale.",
          ru: "Wikipedia описывает Хонгорын Элс как гигантскую систему дюн в Гоби-Гурвансайхане, знаменитую «поющими песками» и масштабными пустынными пейзажами.",
          zh: "Wikipedia 将洪戈尔沙丘描述为戈壁古尔班赛汗国家公园内的大型沙丘群，以“会唱歌的沙丘”和壮阔沙漠景观闻名。",
        },
        highlights: {
          mn: ["Аварга манхан", "Тэмээн аялал", "Дуулах элс"],
          en: ["Giant dunes", "Camel ride", "Singing sands"],
          ru: ["Гигантские дюны", "Поездка на верблюдах", "Поющие пески"],
          zh: ["巨型沙丘", "骑骆驼", "鸣沙"],
        },
        fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/1/11/Khongoryn_els.jpg",
      },
      {
        key: "yolyn-am",
        wikipediaTitle: { en: "Yolyn_Am", ru: "Ёлын-Ам", zh: "鹰谷" },
        name: { mn: "Ёлын ам", en: "Yolyn Am", ru: "Ёлын-Ам", zh: "鹰谷" },
        description: {
          mn: "Ёлын ам нь нарийн хавцал, сэрүүн бичил уур амьсгал, мөсөн үлдэгдлээрээ Говийн халуун бүс дунд онцгой ялгардаг байгалийн цогцолбор гэж Wikipedia-д тэмдэглэгдсэн байдаг.",
          en: "Wikipedia describes Yolyn Am as a narrow gorge known for its cool microclimate, steep walls, and seasonal ice even within the hot Gobi region.",
          ru: "Wikipedia описывает Ёлын-Ам как узкое ущелье с прохладным микроклиматом, крутыми стенами и сезонным льдом даже в пределах жаркой Гоби.",
          zh: "Wikipedia 将鹰谷描述为戈壁中的狭长峡谷，以凉爽小气候、陡峭峡壁和季节性冰层而著名。",
        },
        highlights: {
          mn: ["Хавцлын алхалт", "Сэрүүн бичил уур амьсгал", "Үндэсний парк"],
          en: ["Gorge walk", "Cool microclimate", "National park stop"],
          ru: ["Прогулка по ущелью", "Прохладный микроклимат", "Остановка в нацпарке"],
          zh: ["峡谷徒步", "凉爽小气候", "国家公园停靠"],
        },
        fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/8/89/Yolyn_Am.jpg",
      },
    ],
  },
  {
    id: "ulaanbaatar",
    places: [
      {
        key: "sukhbaatar-square",
        wikipediaTitle: { en: "Sükhbaatar_Square", ru: "Площадь_Сухэ-Батора", zh: "苏赫巴托尔广场" },
        name: { mn: "Сүхбаатарын талбай", en: "Sukhbaatar Square", ru: "Площадь Сухэ-Батора", zh: "苏赫巴托尔广场" },
        description: {
          mn: "Сүхбаатарын талбай нь Улаанбаатар хотын төр, соёлын төв талбай бөгөөд орчин үеийн нийслэлийн дүр төрхийг танилцуулах city tour-ийн гол цэг гэж Wikipedia тайлбарладаг.",
          en: "Wikipedia describes Sukhbaatar Square as the civic heart of Ulaanbaatar, framed by government buildings and used as the main orientation point for city tours.",
          ru: "Wikipedia описывает площадь Сухэ-Батора как общественный центр Улан-Батора, окруженный правительственными зданиями и часто служащий отправной точкой city tour.",
          zh: "Wikipedia 将苏赫巴托尔广场介绍为乌兰巴托的公共核心区域，是城市观光最重要的起点之一。",
        },
        highlights: {
          mn: ["Хотын төв", "Алхалтын маршрут", "Фото зогсоол"],
          en: ["City center", "Walking route", "Photo stop"],
          ru: ["Центр города", "Пешеходный маршрут", "Фото-стоп"],
          zh: ["城市中心", "步行路线", "摄影点"],
        },
        fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Sukhbaatar_square.jpg",
      },
      {
        key: "gandan",
        wikipediaTitle: { en: "Gandantegchinlen_Monastery", ru: "Гандантэгченлин", zh: "甘丹寺" },
        name: {
          mn: "Гандантэгчэнлин хийд",
          en: "Gandantegchinlen Monastery",
          ru: "Монастырь Гандантэгченлин",
          zh: "甘丹寺",
        },
        description: {
          mn: "Гандантэгчэнлин хийд нь Улаанбаатарын хамгийн том, идэвхтэй буддын хийдүүдийн нэг бөгөөд шашин, соёлын өдөр аяллын гол цэг гэж Wikipedia-д дурддаг.",
          en: "Wikipedia lists Gandantegchinlen as one of Ulaanbaatar's most active monasteries and a key stop for understanding living Buddhist culture in the capital.",
          ru: "Wikipedia называет Гандантэгченлин одним из самых активных монастырей Улан-Батора и важной точкой знакомства с живой буддийской культурой столицы.",
          zh: "Wikipedia 介绍甘丹寺为乌兰巴托最重要且仍在使用的佛教寺院之一，是了解首都宗教文化的重要站点。",
        },
        highlights: {
          mn: ["Амьд хийдийн орчин", "Соёлын танилцуулга", "Өглөөний маршрут"],
          en: ["Living monastery", "Cultural insight", "Morning visit"],
          ru: ["Действующий монастырь", "Культурное знакомство", "Утренний визит"],
          zh: ["活跃寺院", "文化体验", "上午行程"],
        },
        fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Gandantegchinlen_Monastery.jpg",
      },
      {
        key: "zaisan",
        wikipediaTitle: { en: "Zaisan_Memorial", ru: "Мемориал_Зайсан", zh: "宰桑纪念碑" },
        name: { mn: "Зайсангийн дурсгал", en: "Zaisan Memorial", ru: "Мемориал Зайсан", zh: "宰桑纪念碑" },
        description: {
          mn: "Зайсангийн дурсгал нь хотыг бүхэлд нь тольдох өндөрлөг дээр байрладаг бөгөөд оройн city lookout, фото зогсоолын хамгийн түгээмэл цэгүүдийн нэг гэж Wikipedia тэмдэглэдэг.",
          en: "Wikipedia describes Zaisan Memorial as a hilltop monument with broad views across Ulaanbaatar, popular for evening lookouts and panoramic photos.",
          ru: "Wikipedia описывает мемориал Зайсан как расположенный на холме обзорный пункт с широкими видами на Улан-Батор, особенно популярный вечером.",
          zh: "Wikipedia 将宰桑纪念碑描述为俯瞰乌兰巴托全景的高地观景点，是傍晚摄影与城市远眺的热门地点。",
        },
        highlights: {
          mn: ["Хотын панорам", "Оройн үзэмж", "Фото цэг"],
          en: ["City panorama", "Evening view", "Photo point"],
          ru: ["Панорама города", "Вечерний вид", "Фото-точка"],
          zh: ["城市全景", "傍晚景观", "摄影点"],
        },
        fallbackImage: "https://upload.wikimedia.org/wikipedia/commons/3/30/Zaisan_Memorial.jpg",
      },
    ],
  },
];

const fetchWikipediaSummary = cache(async (locale: Locale, title: string) => {
  const host = wikipediaHostByLocale[locale];
  const response = await fetch(`https://${host}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "ErkhetSolarTours/1.0 (erkhetsolartours@gmail.com)",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as WikipediaSummaryPayload;
  return {
    extract: payload.extract?.trim(),
    image: payload.originalimage?.source || payload.thumbnail?.source || "",
    url: payload.content_urls?.desktop?.page || buildWikipediaUrl(host, title),
  };
});

function buildWikipediaUrl(host: string, title: string) {
  return `https://${host}.wikipedia.org/wiki/${encodeURIComponent(title).replace(/%20/g, "_")}`;
}

async function resolvePlace(locale: Locale, place: PlaceSeed): Promise<LocalizedDestinationPlace> {
  const localizedTitle = place.wikipediaTitle[locale] || place.wikipediaTitle.en;
  const hasLocaleSpecificTitle = Boolean(place.wikipediaTitle[locale]);
  const localizedSummary = await fetchWikipediaSummary(locale, localizedTitle);
  const englishSummary = locale === "en" ? localizedSummary : await fetchWikipediaSummary("en", place.wikipediaTitle.en);
  const description = locale === "en" || hasLocaleSpecificTitle
    ? localizedSummary?.extract || place.description[locale]
    : place.description[locale];

  return {
    key: place.key,
    name: place.name[locale],
    description,
    image: localizedSummary?.image || englishSummary?.image || place.fallbackImage,
    highlights: place.highlights[locale],
    sourceUrl: localizedSummary?.url || englishSummary?.url || buildWikipediaUrl("en", place.wikipediaTitle.en),
    sourceLabel: wikipediaSourceLabel[locale],
  };
}

export async function getWikipediaDestinations(locale: Locale): Promise<LocalizedDestinationRegionBase[]> {
  return Promise.all(
    regionSeeds.map(async (region) => {
      const places = await Promise.all(region.places.map((place) => resolvePlace(locale, place)));

      return {
        id: region.id,
        image: places[0]?.image || region.places[0].fallbackImage,
        places,
      };
    }),
  );
}

